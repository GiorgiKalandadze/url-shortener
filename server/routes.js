const router = require('express').Router();
const joiValidator = require('./common/joi-validator');
const Joi = require('joi');
const config = require('./common/config');
const DBManager = require('./common/db-manager');
const crypto = require('crypto');
const swaggerUi = require('swagger-ui-express');
const YAML = require('js-yaml');
const fs = require('fs');
const path = require('path');
const swaggerDocument = YAML.load(
    fs.readFileSync(path.join(__dirname, './swagger.yaml'), 'utf8'),
);

router.use(
    '/swagger-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument),
);


router.get('/', (req, res) => {
    res.send('Welcome to the URL shortener service');
});

router.post('/v1/shortURL',
    joiValidator({
        body: Joi.object({
            originalUrl: Joi.string().uri().required(),
        }),
    }),
    async (req, res) => {
        const {originalUrl} = req.body;

        function shortenUrl() {
            const urlCode = crypto.randomBytes(4).toString('hex');
            return `${process.env.SERVER_DOMAIN}/${urlCode}`;
        }

        let shortURL;
        let urlExists = true;
        while (urlExists) {
            shortURL = shortenUrl();
            urlExists = await DBManager.getDocument(config.MONGO_DATABASE, config.MONGO_COLLECTION_URL, {shortURL});
        }

        try {
            await DBManager.insertDocument(config.MONGO_DATABASE, config.MONGO_COLLECTION_URL, {originalUrl, shortURL});
            res.status(201).json({originalUrl, shortURL});
        } catch (e) {
            res.status(500).send('Internal server error');
        }
    });

router.get('/:code',
    joiValidator({
        params: Joi.object({
            code: Joi.string().required(),
        }),
    }),
    async (req, res) => {
        const {code} = req.params;
        const shortURL = `${process.env.SERVER_DOMAIN}/${code}`;
        try
        {
            const document = await DBManager.getDocument(config.MONGO_DATABASE, config.MONGO_COLLECTION_URL, {shortURL});
            if (document) {
                res.status(302).redirect(document.originalUrl);
            } else {
                res.status(404).send('Not found');
            }
        } catch (e) {
            // TODO: Add logging errors
            res.status(500).send('Internal server error');
        }
    });

module.exports = router;