import React from 'react';
import PropTypes from 'prop-types';

import {
  Modal, ModalBody, Nav, NavItem, NavLink, TabContent, TabPane,
} from 'reactstrap';

import { withTranslation } from 'react-i18next';

import PageListIcon from './Icons/PageListIcon';
import TimeLineIcon from './Icons/TimeLineIcon';
import RecentChangesIcon from './Icons/RecentChangesIcon';
import AttachmentIcon from './Icons/AttachmentIcon';
import ShareLinkIcon from './Icons/ShareLinkIcon';

import { withUnstatedContainers } from './UnstatedUtils';
import PageAccessoriesContainer from '../services/PageAccessoriesContainer';
import PageAttachment from './PageAttachment';
import PageTimeline from './PageTimeline';
import PageList from './PageList';
import PageHistory from './PageHistory';
import ShareLink from './ShareLink/ShareLink';

const PageAccessoriesModal = (props) => {
  const { t, pageAccessoriesContainer } = props;
  const { switchActiveTab } = pageAccessoriesContainer;
  const { activeTab } = pageAccessoriesContainer.state;

  function closeModalHandler() {
    if (props.onClose == null) {
      return;
    }
    props.onClose();
  }

  const menu = document.getElementsByClassName('nav'); // 上部に持ってきた
  const navId = document.getElementById('nav-width');
  // Values are set.

  // Might make this dynamic for px, %, pt, em
  function getPercentage(min, max) {
    return min / max * 100;
  }

  // Not using reduce, because IE8 doesn't supprt it
  function getArraySum(arr) {
    let sum = 0;
    [].forEach.call(arr, (el, index) => {
      sum += el;
    });
    return sum;
  }

  function navSlider(menu, callback) { // ok
    const arrayMenu1 = Array.from(menu);
    const menuWidth = arrayMenu1.offsetWidth; // not ok

    // We only want the <li> </li> tags
    const navTabs = document.querySelectorAll('li.nav-link');

    if (menu.length > 0) {
      const marginLeft = [];
      // Loop through nav children i.e li
      [].forEach.call(navTabs, (el, index) => {
        // Dynamic width/margin calculation for hr
        const width = getPercentage(el.offsetWidth, navId.offsetWidth);
        let tempMarginLeft = 0;
        // We don't want to modify first elements positioning
        if (index !== 0) {
          tempMarginLeft = getArraySum(marginLeft);
        }
        // Set mouse event [click]
        callback(el, width, tempMarginLeft);
        /* We store it in array because the later accumulated value is used for positioning */
        marginLeft.push(width);
      });
    }
  }

  if (menu) {
    // CLICK
    const menuSliderClick = document.getElementById('nav_slide_click');
    console.log('menu clicked');
    if (menuSliderClick) {
      const arrayMenu = Array.from(menu); // 変換してみた

      navSlider(arrayMenu, (el, width, tempMarginLeft) => {
        el.onclick = () => {
          menuSliderClick.style.width = `${width}%`;
          menuSliderClick.style.marginLeft = `${tempMarginLeft}%`;
        };
      });
    }
  } // endif


  return (
    <React.Fragment>
      <Modal size="xl" isOpen={props.isOpen} toggle={closeModalHandler} className="grw-page-accessories-modal">
        <ModalBody>
          <Nav className="nav-title" id="nav-width">
            <NavItem type="button" className={`nav-link ${activeTab === 'pagelist' && 'active'}`}>
              <NavLink
                onClick={() => {
                  switchActiveTab('pagelist');
                }}
              >
                <PageListIcon />
                {t('page_list')}
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'timeline' && 'active'}`}>
              <NavLink
                onClick={() => {
                  switchActiveTab('timeline');
                }}
              >
                <TimeLineIcon />
                {t('Timeline View')}
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'page-history' && 'active'}`}>
              <NavLink
                onClick={() => {
                  switchActiveTab('page-history');
                }}
              >
                <RecentChangesIcon />
                {t('History')}
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'attachment' && 'active'}`}>
              <NavLink
                onClick={() => {
                  switchActiveTab('attachment');
                }}
              >
                <AttachmentIcon />
                {t('attachment_data')}
              </NavLink>
            </NavItem>
            <NavItem type="button" className={`nav-link ${activeTab === 'share-link' && 'active'}`}>
              <NavLink
                onClick={() => {
                  switchActiveTab('share-link');
                }}
              >
                <ShareLinkIcon />
                {t('share_links.share_link_management')}
              </NavLink>
            </NavItem>
          </Nav>
          <hr id="nav_slide_click" className="my-0"></hr>
          <TabContent activeTab={activeTab}>

            <TabPane tabId="pagelist">
              {pageAccessoriesContainer.state.activeComponents.has('pagelist') && <PageList />}
            </TabPane>
            <TabPane tabId="timeline" className="p-4">
              {pageAccessoriesContainer.state.activeComponents.has('timeline') && <PageTimeline /> }
            </TabPane>
            <TabPane tabId="page-history">
              <div className="overflow-auto">
                {pageAccessoriesContainer.state.activeComponents.has('page-history') && <PageHistory /> }
              </div>
            </TabPane>
            <TabPane tabId="attachment" className="p-4">
              {pageAccessoriesContainer.state.activeComponents.has('attachment') && <PageAttachment />}
            </TabPane>
            <TabPane tabId="share-link" className="p-4">
              {pageAccessoriesContainer.state.activeComponents.has('share-link') && <ShareLink />}
            </TabPane>
          </TabContent>
        </ModalBody>
      </Modal>
    </React.Fragment>
  );
};

/**
 * Wrapper component for using unstated
 */
const PageAccessoriesModalWrapper = withUnstatedContainers(PageAccessoriesModal, [PageAccessoriesContainer]);

PageAccessoriesModal.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  // pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
  pageAccessoriesContainer: PropTypes.instanceOf(PageAccessoriesContainer).isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func,
};

export default withTranslation()(PageAccessoriesModalWrapper);
