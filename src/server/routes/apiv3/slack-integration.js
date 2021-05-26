const express = require('express');
const mongoose = require('mongoose');
const urljoin = require('url-join');

const loggerFactory = require('@alias/logger');

const { verifySlackRequest, generateWebClient } = require('@growi/slack');

const logger = loggerFactory('growi:routes:apiv3:slack-integration');
const router = express.Router();
const SlackAppIntegration = mongoose.model('SlackAppIntegration');

module.exports = (crowi) => {
  this.app = crowi.express;

  const { configManager } = crowi;

  // Check if the access token is correct
  async function verifyAccessTokenFromProxy(req, res, next) {
    const tokenPtoG = req.headers['x-growi-ptog-tokens'];

    if (tokenPtoG == null) {
      const message = 'The value of header \'x-growi-ptog-tokens\' must not be empty.';
      logger.warn(message, { body: req.body });
      return res.status(400).send({ message });
    }

    const slackAppIntegration = await SlackAppIntegration.findOne({ tokenPtoG });

    logger.debug('verifyAccessTokenFromProxy', {
      tokenPtoG,
    });

    if (slackAppIntegration == null) {
      return res.status(403).send({
        message: 'The access token that identifies the request source is slackbot-proxy is invalid. Did you setup with `/growi register`?',
      });
    }

    req.shareSearchResults = slackAppIntegration.tokenGtoP;

    next();
  }

  const addSigningSecretToReq = (req, res, next) => {
    req.slackSigningSecret = configManager.getConfig('crowi', 'slackbot:signingSecret');
    return next();
  };

  const generateClientForResponse = (req, res, next) => {
    const currentBotType = crowi.configManager.getConfig('crowi', 'slackbot:currentBotType');

    if (currentBotType == null) {
      throw new Error('The config \'SLACK_BOT_TYPE\'(ns: \'crowi\', key: \'slackbot:currentBotType\') must be set.');
    }

    let token;

    // connect directly
    if (req.shareSearchResults == null) {
      token = crowi.configManager.getConfig('crowi', 'slackbot:token');
      req.client = generateWebClient(token);
      return next();
    }

    // connect to proxy
    const proxyServerUri = crowi.configManager.getConfig('crowi', 'slackbot:proxyServerUri');
    const serverUri = urljoin(proxyServerUri, '/g2s');
    const headers = {
      'x-growi-gtop-tokens': req.shareSearchResults,
    };

    req.client = generateWebClient(token, serverUri, headers);
    return next();
  };

  async function handleCommands(req, res) {
    const { client, body } = req;

    if (body.text == null) {
      return 'No text.';
    }

    /*
     * TODO: use parseSlashCommand
     */

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    const args = body.text.split(' ');
    const command = args[0];

    try {
      switch (command) {
        case 'search':
          await crowi.slackBotService.showEphemeralSearchResults(client, body, args);
          break;
        case 'create':
          await crowi.slackBotService.createModal(client, body);
          break;
        default:
          await crowi.slackBotService.notCommand(client, body);
          break;
      }
    }
    catch (error) {
      logger.error(error);
      return res.send(error.message);
    }
  }

  router.post('/commands', addSigningSecretToReq, verifySlackRequest, generateClientForResponse, async(req, res) => {
    return handleCommands(req, res);
  });

  router.post('/proxied/commands', verifyAccessTokenFromProxy, generateClientForResponse, async(req, res) => {
    const { body } = req;

    // eslint-disable-next-line max-len
    // see: https://api.slack.com/apis/connections/events-api#the-events-api__subscribing-to-event-types__events-api-request-urls__request-url-configuration--verification
    if (body.type === 'url_verification') {
      return res.send({ challenge: body.challenge });
    }

    return handleCommands(req, res);
  });


  const handleBlockActions = async(payload) => {
    const { action_id: actionId } = payload.actions[0];

    switch (actionId) {
      case 'shareSearchResults': {
        await crowi.slackBotService.shareSearchResults(payload);
        break;
      }
      case 'showNextResults': {
        const parsedValue = JSON.parse(payload.actions[0].value);

        const { body, args, offset } = parsedValue;
        const newOffset = offset + 10;
        await crowi.slackBotService.showEphemeralSearchResults(body, args, newOffset);
        break;
      }
      default:
        break;
    }
  };

  const handleViewSubmission = async(payload) => {
    const { callback_id: callbackId } = payload.view;

    switch (callbackId) {
      case 'createPage':
        await crowi.slackBotService.createPageInGrowi(payload);
        break;
      default:
        break;
    }
  };

  async function handleInteractions(req, res) {

    // Send response immediately to avoid opelation_timeout error
    // See https://api.slack.com/apis/connections/events-api#the-events-api__responding-to-events
    res.send();

    const { client } = req;
    const payload = JSON.parse(req.body.payload);
    const { type } = payload;

    try {
      switch (type) {
        case 'block_actions':
          await handleBlockActions(client, payload);
          break;
        case 'view_submission':
          await handleViewSubmission(client, payload);
          break;
        default:
          break;
      }
    }
    catch (error) {
      logger.error(error);
      return res.send(error.message);
    }

  }

  router.post('/interactions', addSigningSecretToReq, verifySlackRequest, generateClientForResponse, async(req, res) => {
    return handleInteractions(req, res);
  });

  router.post('/proxied/interactions', verifyAccessTokenFromProxy, generateClientForResponse, async(req, res) => {
    return handleInteractions(req, res);
  });

  return router;
};
