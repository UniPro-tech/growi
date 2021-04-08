import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import AppContainer from '../../../services/AppContainer';
import { withUnstatedContainers } from '../../UnstatedUtils';
import { toastSuccess, toastError } from '../../../util/apiNotification';

import AccessTokenSettings from './AccessTokenSettings';
import OfficialBotSettings from './OfficialBotSettings';
import CustomBotWithoutProxySettings from './CustomBotWithoutProxySettings';
import CustomBotWithProxySettings from './CustomBotWithProxySettings';
import ConfirmBotChangeModal from './ConfirmBotChangeModal';


const SlackIntegration = (props) => {
  const { appContainer } = props;
  const { t } = useTranslation();
  const [currentBotType, setCurrentBotType] = useState(null);
  const [selectedBotType, setSelectedBotType] = useState(null);
  const [accessToken, setAccessToken] = useState('');

  const fetchData = useCallback(async() => {
    try {
      const response = await appContainer.apiv3.get('slack-integration/');
      const { currentBotType, accessToken } = response.data.slackBotSettingParams;
      setCurrentBotType(currentBotType);
      setAccessToken(accessToken);
    }
    catch (err) {
      toastError(err);
    }
  }, [appContainer.apiv3]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBotTypeSelect = (clickedBotType) => {
    if (clickedBotType === currentBotType) {
      return;
    }
    if (currentBotType === null) {
      setCurrentBotType(clickedBotType);
      return;
    }
    setSelectedBotType(clickedBotType);
  };

  const cancelBotChangeHandler = () => {
    setSelectedBotType(null);
  };

  const changeCurrentBotSettingsHandler = async() => {
    try {
      const res = await appContainer.apiv3.put('slack-integration/custom-bot-without-proxy', {
        slackSigningSecret: '',
        slackBotToken: '',
        currentBotType: selectedBotType,
      });
      setCurrentBotType(res.data.customBotWithoutProxySettingParams.slackBotType);
      setSelectedBotType(null);
      toastSuccess(t('admin:slack_integration.bot_reset_successful'));
    }
    catch (err) {
      toastError(err);
    }
  };

  const generateTokenHandler = async() => {
    try {
      await appContainer.apiv3.put('slack-integration/access-token');
      fetchData();
    }
    catch (err) {
      toastError(err);
    }
  };

  const discardTokenHandler = async() => {
    try {
      await appContainer.apiv3.delete('slack-integration/access-token');
      fetchData();
      toastSuccess(t('admin:slack_integration.bot_reset_successful'));
    }
    catch (err) {
      toastError(err);
    }
  };

  let settingsComponent = null;

  switch (currentBotType) {
    case 'official-bot':
      settingsComponent = <OfficialBotSettings />;
      break;
    case 'custom-bot-without-proxy':
      settingsComponent = (
        <CustomBotWithoutProxySettings />
      );
      break;
    case 'custom-bot-with-proxy':
      settingsComponent = <CustomBotWithProxySettings />;
      break;
  }

  const showBotTypeLebel = (level) => {
    return <span>{t(`admin:slack_integration.selecting_bot_types.${level}`)}</span>;
  };
  const showBotTypeLabel = (label) => {
    return <span>{t(`admin:slack_integration.selecting_bot_types.${label}`)}</span>;
  };
  const showBotTypeDiscription = (desc) => {
    return <span className="text-blue">{t(`admin:slack_integration.selecting_bot_types.${desc}`)}</span>;
  };

  return (
    <>
      <ConfirmBotChangeModal
        isOpen={selectedBotType != null}
        onConfirmClick={changeCurrentBotSettingsHandler}
        onCancelClick={cancelBotChangeHandler}
      />

      <AccessTokenSettings
        accessToken={accessToken}
        onClickDiscardButton={discardTokenHandler}
        onClickGenerateToken={generateTokenHandler}
      />

      <div className="selecting-bot-type">
        <h2 className="admin-setting-header mb-4">
          {t('admin:slack_integration.slack_bot')}
          <span className="ml-2 btn-link">
            <span className="mr-1">{t('admin:slack_integration.detailed_explanation')}</span>
            <i className="fa fa-external-link" aria-hidden="true"></i>
          </span>

        </h2>

        {t('admin:slack_integration.selecting_bot_type')}

        <div className="row my-4">
          <div className="card-deck mx-auto">

            <div
              className={`card admin-bot-card mx-3 rounded shadow ${currentBotType === 'official-bot' && 'border-primary'}`}
              onClick={() => handleBotTypeSelect('official-bot')}
            >
              <h3 className={`card-header mb-0 py-3 text-center   ${currentBotType === 'official-bot' && 'bg-primary text-light'}`}>
                <span className="mr-2">
                  {t('admin:slack_integration.official_bot')}
                </span>
                <span className="badge badge-info mr-2">
                  {t('admin:slack_integration.recommended')}
                </span>
                <i className={`fa fa-external-link btn-link ${currentBotType === 'official-bot' && 'bg-primary text-light'}`} aria-hidden="true"></i>
              </h3>
              <div className="card-body px-4 py-5">
                <p className="card-text">
                  <div className="text-center">
                    {showBotTypeLebel('for_intermediate')}
                  </div>
                  <div className="mt-4">
                    <div className="d-flex justify-content-between mb-2">
                      {showBotTypeLabel('set_up_to_take_time')}
                      {showBotTypeDiscription('easy')}
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      {showBotTypeLabel('integration_to_multi_workspaces')}
                      {showBotTypeDiscription('possible')}
                    </div>
                    <div className="d-flex justify-content-between">
                      {showBotTypeLabel('security_control')}
                      {showBotTypeDiscription('impossible')}
                    </div>
                  </div>
                </p>
              </div>
            </div>


            {/* ここから */}
            <div
              className={`card admin-bot-card mx-3 rounded shadow ${currentBotType === 'custom-bot-without-proxy' && 'border-primary'}`}
              onClick={() => handleBotTypeSelect('custom-bot-without-proxy')}
            >
              <h3 className={`card-header mb-0 py-3 text-center   ${currentBotType === 'custom-bot-without-proxy' && 'bg-primary text-light'}`}>
                <span className="mr-2">
                  {t('admin:slack_integration.custom_bot_without_proxy')}
                </span>
                <i
                  className={`fa fa-external-link btn-link ${currentBotType === 'custom-bot-without-proxy' && 'bg-primary text-light'}`}
                  aria-hidden="true"
                >
                </i>
              </h3>
              <div className="card-body px-4 py-5">
                <p className="card-text">
                  <div className="text-center">
                    {showBotTypeLebel('for_advanced')}
                  </div>
                  <div className="mt-4">
                    <div className="d-flex justify-content-between mb-2">
                      {showBotTypeLabel('set_up_to_take_time')}
                      {showBotTypeDiscription('easy')}
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      {showBotTypeLabel('integration_to_multi_workspaces')}
                      {showBotTypeDiscription('possible')}
                    </div>
                    <div className="d-flex justify-content-between">
                      {showBotTypeLabel('security_control')}
                      {showBotTypeDiscription('impossible')}
                    </div>
                  </div>
                </p>
              </div>
            </div>

            {/* <div
              className={`card admin-bot-card mx-3 py-5 rounded shadow ${currentBotType === 'custom-bot-without-proxy' ? 'border-info' : ''}`}
              onClick={() => handleBotTypeSelect('custom-bot-without-proxy')}
            >
              <div className="card-body">
                <h5 className="card-title">Custom Bot without proxy</h5>
                <p className="card-text">セットアップの手間 </p>
              </div>
            </div> */}

            <div
              className={`card admin-bot-card mx-3 rounded shadow ${currentBotType === 'custom-bot-with-proxy' && 'border-primary'}`}
              onClick={() => handleBotTypeSelect('custom-bot-with-proxy')}
            >
              <h3 className={`card-header mb-0 py-3 text-center   ${currentBotType === 'custom-bot-with-proxy' && 'bg-primary text-light'}`}>
                <span className="mr-2">
                  {t('admin:slack_integration.custom_bot_with_proxy')}
                </span>
                <i className={`fa fa-external-link btn-link ${currentBotType === 'custom-bot-with-proxy' && 'bg-primary text-light'}`} aria-hidden="true"></i>
              </h3>
              <div className="card-body px-4 py-5">
                <p className="card-text">
                  <div className="text-center">
                    {showBotTypeLebel('for_beginners')}
                  </div>
                  <div className="mt-4">
                    <div className="d-flex justify-content-between mb-2">
                      {showBotTypeLabel('set_up_to_take_time')}
                      {showBotTypeDiscription('easy')}
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      {showBotTypeLabel('integration_to_multi_workspaces')}
                      {showBotTypeDiscription('possible')}
                    </div>
                    <div className="d-flex justify-content-between">
                      {showBotTypeLabel('security_control')}
                      {showBotTypeDiscription('impossible')}
                    </div>
                  </div>
                </p>
              </div>
            </div>

            {/* <div
              className={`card admin-bot-card mx-3 py-5 rounded shadow ${currentBotType === 'custom-bot-with-proxy' ? 'border-info' : ''}`}
              onClick={() => handleBotTypeSelect('custom-bot-with-proxy')}
            >
              <div className="card-body">
                <h5 className="card-title">Custom Bot with proxy</h5>
                <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content.</p>
              </div>
            </div> */}

          </div>
        </div>
      </div>

      {settingsComponent}
    </>
  );
};

const SlackIntegrationWrapper = withUnstatedContainers(SlackIntegration, [AppContainer]);

SlackIntegration.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default SlackIntegrationWrapper;
