import React from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import { DevidedPagePath } from '@growi/core';
import PagePathHierarchicalLink from '~/components/PagePathHierarchicalLink';
import LinkedPagePath from '~/models/linked-page-path';

import { withUnstatedContainers } from '../UnstatedUtils';
import AppContainer from '~/client/services/AppContainer';
import NavigationContainer from '~/client/services/NavigationContainer';
import PageContainer from '~/client/services/PageContainer';

import CopyDropdown from '../Page/CopyDropdown';
import TagLabels from '../Page/TagLabels';
import SubnavButtons from './SubNavButtons';
import PageEditorModeManager from './PageEditorModeManager';

import AuthorInfo from './AuthorInfo';
import DrawerToggler from './DrawerToggler';

const PagePathNav = ({
  // eslint-disable-next-line react/prop-types
  pageId, pagePath, isEditorMode, isCompactMode,
}) => {

  const dPagePath = new DevidedPagePath(pagePath, false, true);

  let formerLink;
  let latterLink;

  // one line
  if (dPagePath.isRoot || dPagePath.isFormerRoot || isEditorMode) {
    const linkedPagePath = new LinkedPagePath(pagePath);
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePath} />;
  }
  // two line
  else {
    const linkedPagePathFormer = new LinkedPagePath(dPagePath.former);
    const linkedPagePathLatter = new LinkedPagePath(dPagePath.latter);
    formerLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathFormer} />;
    latterLink = <PagePathHierarchicalLink linkedPagePath={linkedPagePathLatter} basePath={dPagePath.former} />;
  }

  const copyDropdownId = `copydropdown${isCompactMode ? '-subnav-compact' : ''}-${pageId}`;
  const copyDropdownToggleClassName = 'd-block text-muted bg-transparent btn-copy border-0 py-0';

  return (
    <div className="grw-page-path-nav">
      {formerLink}
      <span className="d-flex align-items-center">
        <h1 className="m-0">{latterLink}</h1>
        <div className="mx-2">
          <CopyDropdown
            pageId={pageId}
            pagePath={pagePath}
            dropdownToggleId={copyDropdownId}
            dropdownToggleClassName={copyDropdownToggleClassName}
          >
            <i className="ti-clipboard"></i>
          </CopyDropdown>
        </div>
      </span>
    </div>
  );
};

const GrowiSubNavigation = (props) => {
  const {
    appContainer,
    navigationContainer,
    isCompactMode,
    isSearchPageMode,
  } = props;
  const { isDrawerMode, editorMode, isDeviceSmallerThanMd } = navigationContainer.state;

  let {
    isPageExist, isAbleToShowTagLabel, isAbleToShowPageEditorModeManager, isAbleToShowPageAuthors,
  } = false;
  let {
    pageId,
    path,
  } = props;

  if (props.pageContainer != null) {
    ({
      pageId,
      path,
    } = props.pageContainer.state);
    isPageExist = props.pageContainer.isPageExist;
    isAbleToShowTagLabel = props.pageContainer.isAbleToShowTagLabel;
    isAbleToShowPageEditorModeManager = props.pageContainer.isAbleToShowPageEditorModeManager;
    isAbleToShowPageAuthors = props.pageContainer.isAbleToShowPageAuthors;
  }

  const { isGuestUser } = appContainer;
  const isEditorMode = editorMode !== 'view';
  // Tags cannot be edited while the new page and editorMode is view
  const isTagLabelHidden = editorMode !== ('edit' && !isPageExist);

  function onPageEditorModeButtonClicked(viewType) {
    navigationContainer.setEditorMode(viewType);
  }

  return (
    <div className={`grw-subnav container-fluid d-flex align-items-center justify-content-between ${isCompactMode ? 'grw-subnav-compact d-print-none' : ''}`}>

      {/* Left side */}
      <div className="d-flex grw-subnav-left-side">
        { isDrawerMode && (
          <div className={`d-none d-md-flex align-items-center ${isEditorMode ? 'mr-2 pr-2' : 'border-right mr-4 pr-4'}`}>
            <DrawerToggler />
          </div>
        ) }

        <div className="grw-path-nav-container">
          {/* TODO : display tags when this component is used in SearchResultContent too.
              For that, refactor TagLabels such that it can be used while not depending on pageContainer
              TASK: #80623 https://estoc.weseek.co.jp/redmine/issues/80623
          */}
          { isAbleToShowTagLabel && !isCompactMode && !isTagLabelHidden && (
            <div className="grw-taglabels-container">
              <TagLabels editorMode={editorMode} />
            </div>
          ) }
          <PagePathNav pageId={pageId} pagePath={path} isEditorMode={isEditorMode} isCompactMode={isCompactMode} />
        </div>
      </div>

      {/* Right side */}
      <div className="d-flex">

        <div className="d-flex flex-column align-items-end">
          <div className="d-flex">
            <SubnavButtons isCompactMode={isCompactMode} />
            {/* TODO: refactor SubNavButtons in a way that it can be used independently from pageContainer
              TASK : #80481 https://estoc.weseek.co.jp/redmine/issues/80481
             */}
          </div>
          <div className="mt-2">
            {isAbleToShowPageEditorModeManager && !isSearchPageMode && (
              <PageEditorModeManager
                onPageEditorModeButtonClicked={onPageEditorModeButtonClicked}
                isBtnDisabled={isGuestUser}
                editorMode={editorMode}
                isDeviceSmallerThanMd={isDeviceSmallerThanMd}
              />
            )}
          </div>
        </div>

        {/* Page Authors */}
        { (isAbleToShowPageAuthors && !isCompactMode && isSearchPageMode) && (
          <ul className="authors text-nowrap border-left d-none d-lg-block d-edit-none py-2 pl-4 mb-0 ml-3">
            <li className="pb-1">
              <AuthorInfo user={props.pageContainer.state.creator} date={props.pageContainer.state.createdAt} locate="subnav" />
            </li>
            <li className="mt-1 pt-1 border-top">
              <AuthorInfo user={props.pageContainer.state.revisionAuthor} date={props.pageContainer.updatedAt} mode="update" locate="subnav" />
            </li>
          </ul>
        )}
      </div>
    </div>
  );
};

GrowiSubNavigation.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
  navigationContainer: PropTypes.instanceOf(NavigationContainer).isRequired,
  pageContainer: PropTypes.instanceOf(PageContainer),
  isCompactMode: PropTypes.bool,
  // Props for searchResultContent
  pageId: PropTypes.string,
  path: PropTypes.string,
  isSearchPageMode: PropTypes.bool,
};


const GrowiSubNavigationWrapper = (props) => {
  let GrowiSubNavigationUnstatedWrapper = <></>;
  if (props.isSearchPageMode) {
    GrowiSubNavigationUnstatedWrapper = withUnstatedContainers(GrowiSubNavigation, [AppContainer, NavigationContainer]);
    return <GrowiSubNavigationUnstatedWrapper isSearchPageMode pageId={props.pageId} path={props.path}></GrowiSubNavigationUnstatedWrapper>;
  }
  GrowiSubNavigationUnstatedWrapper = withUnstatedContainers(GrowiSubNavigation, [AppContainer, NavigationContainer, PageContainer]);
  return <GrowiSubNavigationUnstatedWrapper></GrowiSubNavigationUnstatedWrapper>;
};

GrowiSubNavigationWrapper.propTypes = {
  isSearchPageMode: PropTypes.bool,
  pageId: PropTypes.string,
  path: PropTypes.string,
};

export default withTranslation()(GrowiSubNavigationWrapper);
