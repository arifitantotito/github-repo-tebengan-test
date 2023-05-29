import axios from "axios";
import { useRef, useState } from "react";
import { debounce } from "lodash";
import { AiFillStar } from "react-icons/ai";
import { Modal } from "flowbite-react";

export default function Explorer() {
  let inputName = useRef();

  const [repo, setRepo] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectSearch, setSelectSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showPopUp, setShowPopUp] = useState(false);
  const [detail, setDetail] = useState({
    name: "",
    language: "",
    description: "",
    created_at: "",
    updated_at: "",
  });
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const sortOptions = [5, 10, 20];

  const delayedSearch = useRef(
    debounce((key) => {
      onSearch(key);
    }, 500)
  ).current;

  let onSearch = async (key) => {
    try {
      const token = `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`;
      const config = {
        headers: {
          Authorization: `Token ${token}`,
        },
      };

      if (key) {
        let result = await axios.get(
          `https://api.github.com/search/users?q=${key}`,
          config
        );
        let sliceData = result.data.items.slice(0, 5);
        console.log(sliceData);
        setSuggestions(sliceData);
      } else {
        setSuggestions(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  let onDetail = async (name, index) => {
    try {
      console.log(name);
      let response = await axios.get(
        `https://api.github.com/users/${name}/repos`
      );
      console.log(response.data);
      setRepo(response.data);
      setOpen(true);
      setSelectSearch(name);
    } catch (error) {}
  };

  let handleInputChange = (e) => {
    const value = e.target.value;
    inputName.current.value = value;

    delayedSearch(value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSortChange = (option) => {
    setItemsPerPage(option);
    setCurrentPage(1);
  };

  let showPop = async (users, repos) => {
    try {
      console.log(users);
      let response = await axios.get(
        `https://api.github.com/repos/${users}/${repos}`
      );
      console.log(response);
      setShowPopUp(true);
      setDetail(response.data);
    } catch (error) {}
  };

  const lastIndex = currentPage * itemsPerPage;
  const firstIndex = lastIndex - itemsPerPage;
  const displayedRepos = repo.slice(firstIndex, lastIndex);

  return (
    <>
      <div className="h-screen w-screen">
        <div className="p-5 rounded-lg">
          <div className=" max-h-64">
            <div className="grid grid-cols-5 ">
              <div className=" col-span-2 border-r-2 h-screen">
                <div className="p-5">
                  <div className="flex justify-center mb-3">
                    <div className="text-lg font-bold flex justify-center">
                      GitHub List Repository
                    </div>
                  </div>
                  <input
                    ref={inputName}
                    type="text"
                    placeholder="Search users"
                    defaultValue={selectSearch ? selectSearch : null}
                    className="w-full rounded-md mb-5 py-2"
                    onChange={handleInputChange}
                  />
                  <div className="mt-3 h-64 w-full">
                    {suggestions === null ? null : (
                      <>
                        {suggestions.map((value, index) => {
                          return (
                            <button
                              onClick={() => {
                                onDetail(value.login, index);
                              }}
                              className="w-full border rounded-lg mt-1 bg-zinc-400"
                              key={value.id}
                            >
                              <div className="py-2 flex justify-center font-semibold">
                                {value.login}
                              </div>
                            </button>
                          );
                        })}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="col-span-3 ml-10 ">
                {selectSearch ? (
                  <div className="flex justify-between mt-5">
                    <div className=" text-gray-500 ml-16">
                      Showing repositories for "{selectSearch}"
                    </div>
                    <div className="flex mr-16">
                      Sort lists:
                      {sortOptions.map((option) => (
                        <button
                          key={option}
                          className={`ml-2 ${
                            itemsPerPage === option ? "font-bold" : ""
                          }`}
                          onClick={() => handleSortChange(option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mt-5 overflow-x-hidden h-[650px]">
                  {open === true
                    ? displayedRepos.map((val, idx) => {
                        return (
                          <div className="flex justify-center ">
                            <button
                              onClick={() => showPop(val.owner.login, val.name)}
                              className="flex justify-between rounded-lg gap-3 border w-[700px] mt-2 py-3 bg-slate-400 p-3"
                            >
                              <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <div className="font-bold">{idx + 1}.</div>
                                  <div className="font-bold">{val.name}</div>
                                </div>
                                {val.language ? (
                                  <div className="flex justify-start font-medium">
                                    Language: {val.language}
                                  </div>
                                ) : (
                                  <div className="flex justify-start font-medium">
                                    Language: None
                                  </div>
                                )}
                              </div>
                              <div className="flex mt-3">
                                {val.stargazers_count} <AiFillStar size={25} />
                              </div>
                            </button>
                          </div>
                        );
                      })
                    : null}
                </div>
                <div>
                  {open === true && repo.length > itemsPerPage && (
                    <div className="flex justify-center mt-3">
                      <button
                        className="mx-1 text-stone-700"
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        Previous
                      </button>
                      <div className="mx-4">Page {currentPage}</div>
                      <button
                        className="mx-1 text-stone-700"
                        disabled={lastIndex >= repo.length}
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
                <Modal
                  show={showPopUp}
                  size="xl"
                  popup={true}
                  onClose={() => setShowPopUp(!showPopUp)}
                >
                  <Modal.Header />
                  <Modal.Body>
                    <div className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-4">
                      Repository Detail
                    </div>
                    <div className="text-md font-medium mb-2">Title:</div>
                    <input
                      className="w-full py-1 mb-1"
                      value={detail.name}
                      disabled
                    />
                    <div className="text-md font-medium mb-2">Language:</div>
                    <input
                      className="w-full py-1 mb-1"
                      value={detail.language ? detail.language : "None"}
                      disabled
                    />
                    <div className="text-md font-medium mb-2">Description:</div>
                    <input
                      className="w-full py-1 mb-1"
                      value={detail.description ? detail.description : "None"}
                      disabled
                    />
                    <div className="text-md font-medium mb-2">Created at:</div>
                    <input
                      className="w-full py-1 mb-1"
                      value={
                        detail.created_at
                          ? detail.created_at.slice(0, 10)
                          : "None"
                      }
                      disabled
                    />
                    <div className="text-md font-medium mb-2">Updated at:</div>
                    <input
                      className="w-full py-1 mb-1"
                      value={
                        detail.updated_at
                          ? detail.updated_at.slice(0, 10)
                          : "None"
                      }
                      disabled
                    />
                  </Modal.Body>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
