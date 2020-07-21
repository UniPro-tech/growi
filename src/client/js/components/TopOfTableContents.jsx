import React, { useCallback } from 'react';
import PropTypes from 'prop-types';

import { withTranslation } from 'react-i18next';

import PageContainer from '../services/PageContainer';

import { withUnstatedContainers } from './UnstatedUtils';

const TopOfTableContents = (props) => {

  return (
    <>
      {/* TODO GW-3253 add four contents */}
      <div className="liker-and-seenusers d-flex align-items-end pb-1">
        <button type="button" className="bg-transparent border-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35">
            <defs>
              <style>.cls-1{{ fill: none }}</style>
            </defs>
            <g id="レイヤー_2" data-name="レイヤー 2">
              <g id="レイヤー_1-2" data-name="レイヤー 1">
                <g id="グループ_680" data-name="グループ 680">
                  <rect id="長方形_202" data-name="長方形 202" className="cls-1" width="35" height="35" rx="2" />
                  <g id="グループ_678" data-name="グループ 678">
                    <path d="M25.22,11.25H9.63a.75.75,0,0,1,0-1.5H25.22a.75.75,0,0,1,0,1.5Z" />
                    <path d="M24.11,15.71H9.63a.75.75,0,0,1,0-1.5H24.11a.75.75,0,0,1,0,1.5Z" />
                    <path d="M20.77,20.16H9.63a.75.75,0,1,1,0-1.5H20.77a.75.75,0,0,1,0,1.5Z" />
                    <path d="M22.75,24.61H9.63a.75.75,0,0,1,0-1.5H22.75a.75.75,0,0,1,0,1.5Z" />
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </button>

        <button type="button" className="bg-transparent border-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35">
            <defs>
              <style>.cls-1{{ fill: none }}
              </style>
            </defs>
            <g id="レイヤー_2" data-name="レイヤー 2">
              <g id="レイヤー_1-2" data-name="レイヤー 1">
                <g id="グループ_679" data-name="グループ 679">
                  <rect id="長方形_201" data-name="長方形 201" className="cls-1" width="35" height="35" rx="2" />
                  <path
                    id="Icon_material-timeline"
                    data-name="Icon material-timeline"
                    d="M27.93,14.07A1.84,1.84,0,0,1,26.1,15.9a1.47,1.47,0,0,1-.46-.07L22.4,19.07a1.83,1.83,0,1,1-3.59.47,1.49,1.49,0,0,1,.07-.47l-2.33-2.33a1.7,1.7,0,0,1-1,0L11.46,20.9A1.82,1.82,0,1,1,9.7,19.54a1.43,1.43,0,0,1,.46.07l4.16-4.15a1.27,1.27,0,0,1-.06-.48,1.82,1.82,0,0,1,3.64,0,1.86,1.86,0,0,1-.06.48l2.32,2.32a1.91,1.91,0,0,1,.95,0l3.23-3.24a1.83,1.83,0,1,1,3.59-.47Z"
                  />
                </g>
              </g>
            </g>
          </svg>
        </button>

        <button type="button" className="bg-transparent border-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35">
            <defs>
              <style>.cls-1{{ fill: none }}
              </style>
            </defs>
            <g id="レイヤー_2" data-name="レイヤー 2">
              <g id="レイヤー_1-2" data-name="レイヤー 1">
                <g id="グループ_677" data-name="グループ 677">
                  <rect id="長方形_200" data-name="長方形 200" className="cls-1" width="35" height="35" rx="2" />
                  <path d="M17.58,8.15a9.3,9.3,0,0,0-9.19,9.19v.16L6.55,15.66a.59.59,0,0,0-.85,0,.61.61,0,0,0,0,.85l3.4,3.4,3.41-3.4a.61.61,0,0,0,0-.85.59.59,0,0,0-.85,0L9.59,17.73v-.38a8.09,8.09,0,0,1,8-8,8.09,8.09,0,0,1,8,8,8.09,8.09,0,0,1-8,8h-.12a7.63,7.63,0,0,1-5.93-2.87.6.6,0,0,0-.84-.1.61.61,0,0,0-.1.85,8.83,8.83,0,0,0,6.87,3.32h.14a9.3,9.3,0,0,0,9.19-9.2A9.3,9.3,0,0,0,17.58,8.15Z" /><path d="M17.58,11a.6.6,0,0,0-.6.6V17.9l3.72,2.36a.62.62,0,0,0,.32.09.61.61,0,0,0,.51-.28.6.6,0,0,0-.19-.83l-3.16-2V11.61A.6.6,0,0,0,17.58,11Z" />
                </g>
              </g>
            </g>
          </svg>
        </button>

        <button type="button" className="bg-transparent border-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 35 35">
            <defs>
              <style>.cls-1{{ fill: none }}.cls-2{{ isolation: isolate }}
              </style>
            </defs>
            <g id="レイヤー_2" data-name="レイヤー 2">
              <g id="レイヤー_1-2" data-name="レイヤー 1">
                <g id="グループ_727" data-name="グループ 727">
                  <rect id="長方形_200-2" data-name="長方形 200-2" className="cls-1" width="35" height="35" rx="2" />
                  <g id="_" data-name=" " className="cls-2">
                    <g className="cls-2">
                      <path
                        d="M10.89,25.8a2.73,2.73,0,0,1-2-.87,3.15,3.15,0,0,1,0-4.43l9.55-10.13a3.41,3.41,0,0,1,1.68-1,3.58,3.58,0,0,1,1.94.12,4.84,4.84,0,0,1,1.81,1.14,5.27,5.27,0,0,1,.49.63,3.16,3.16,0,0,1,.36.71,4,4,0,0,1,.22.79,4.57,4.57,0,0,1,.07.83,4.16,4.16,0,0,1-1.19,2.94l-7.22,7.67a.53.53,0,0,1-.37.17.47.47,0,0,1-.37-.14.53.53,0,0,1-.17-.37.55.55,0,0,1,.14-.39l7.22-7.67a3.1,3.1,0,0,0,.9-2.23,2.84,2.84,0,0,0-.85-2.17A3.59,3.59,0,0,0,22,10.61a2.65,2.65,0,0,0-1.4-.19,2.34,2.34,0,0,0-1.33.68L9.68,21.23a2.08,2.08,0,0,0,0,3,1.91,1.91,0,0,0,.61.42,1.5,1.5,0,0,0,.7.11A2,2,0,0,0,12.35,24L19.94,16l.15-.17c.05-.07.11-.14.16-.22a.84.84,0,0,0,.13-.27.89.89,0,0,0,.07-.28.51.51,0,0,0-.05-.29.86.86,0,0,0-.2-.28.76.76,0,0,0-.61-.3,1.35,1.35,0,0,0-.72.41l-5.71,6.08a.53.53,0,0,1-.5.15.47.47,0,0,1-.24-.13.45.45,0,0,1-.17-.37.55.55,0,0,1,.15-.38l5.71-6.09a2.24,2.24,0,0,1,1.38-.73,1.78,1.78,0,0,1,1.46.59,1.73,1.73,0,0,1,.55,1.45,2.47,2.47,0,0,1-.8,1.56l-7.59,8.08a3.13,3.13,0,0,1-2.07,1h-.15Z"
                      />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </svg>
        </button>

        <div
          id="liker-list"
          data-user-ids-str="{{ page.liker|slice(-15)|default([])|reverse|join(',') }}"
          data-sum-of-likers="{{ page.liker.length|default(0) }}"
        >
        </div>
        <div
          id="seen-user-list"
          data-user-ids-str="{{ page.seenUsers|slice(-15)|default([])|reverse|join(',') }}"
          data-sum-of-seen-users="{{ page.seenUsers.length|default(0) }}"
        >
        </div>
      </div>
    </>
  );

};

/**
 * Wrapper component for using unstated
 */
const TopOfTableContentsWrapper = withUnstatedContainers(TopOfTableContents, [PageContainer]);

TopOfTableContents.propTypes = {
  pageContainer: PropTypes.instanceOf(PageContainer).isRequired,
};

export default withTranslation()(TopOfTableContentsWrapper);
