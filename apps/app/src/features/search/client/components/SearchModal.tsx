
import React, {
  useState, useCallback, useEffect,
} from 'react';

import Downshift from 'downshift';
import { useRouter } from 'next/router';
import { Modal, ModalBody } from 'reactstrap';

import type { DownshiftItem } from '../interfaces/downshift';
import { useSearchModal } from '../stores/search';

import { SearchForm } from './SearchForm';
import { SearchHelp } from './SearchHelp';
import { SearchMethodMenuItem } from './SearchMethodMenuItem';
import { SearchResultMenuItem } from './SearchResultMenuItem';

const SearchModal = (): JSX.Element => {
  const [searchKeyword, setSearchKeyword] = useState('');

  const { data: searchModalData, close: closeSearchModal } = useSearchModal();

  const router = useRouter();

  const changeSearchTextHandler = useCallback((searchText: string) => {
    setSearchKeyword(searchText);
  }, []);

  const selectSearchMenuItemHandler = useCallback((url: string) => {
    router.push(url);
    closeSearchModal();
  }, [closeSearchModal, router]);

  const enterKeyDownHandlerWithoutSelectedItem = useCallback(() => {
    router.push(`/_search?q=${searchKeyword}`);
    closeSearchModal();
  }, [closeSearchModal, router, searchKeyword]);

  useEffect(() => {
    if (!searchModalData?.isOpened) {
      setSearchKeyword('');
    }
  }, [searchModalData?.isOpened]);

  return (
    <Modal size="lg" isOpen={searchModalData?.isOpened ?? false} toggle={closeSearchModal}>
      <ModalBody>
        <Downshift
          onSelect={(selectedItem: DownshiftItem) => { selectSearchMenuItemHandler(selectedItem.url) }}
        >
          {({
            getRootProps,
            getInputProps,
            getItemProps,
            getMenuProps,
            highlightedIndex,
            setHighlightedIndex,
          }) => (
            <div {...getRootProps({}, { suppressRefError: true })}>
              <SearchForm
                highlightedIndex={highlightedIndex}
                searchKeyword={searchKeyword}
                onChangeSearchText={changeSearchTextHandler}
                onClickCloseModalButton={closeSearchModal}
                onEnterKeyDownHandler={enterKeyDownHandlerWithoutSelectedItem}
                getInputProps={getInputProps}
              />

              {/* see: https://github.com/downshift-js/downshift/issues/582#issuecomment-423592531 */}
              <ul {...getMenuProps({ onMouseLeave: () => { setHighlightedIndex(-1) } })} className="list-unstyled">
                <div className="border-top mt-3 mb-3" />
                <SearchMethodMenuItem
                  searchKeyword={searchKeyword}
                  highlightedIndex={highlightedIndex}
                  getItemProps={getItemProps}
                />
                <div className="border-top mt-3 mb-3" />
                <SearchResultMenuItem
                  searchKeyword={searchKeyword}
                  highlightedIndex={highlightedIndex}
                  getItemProps={getItemProps}
                />
              </ul>
            </div>
          )}
        </Downshift>
        <SearchHelp />
      </ModalBody>
    </Modal>
  );
};

export default SearchModal;
