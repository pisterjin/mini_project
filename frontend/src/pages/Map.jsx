import React, { useState } from "react";
import MainHeader from "../components/MainHeader";

export default function Map() {
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleChangeSearch = (e) => {
    setSearchKeyword(e.target.value);
  };

  const handleSearch = () => {
    console.log("검색어:", searchKeyword);
  };

  return (
    <div>
      <MainHeader
        searchKeyword={searchKeyword}
        onChangeSearch={handleChangeSearch}
        onSearch={handleSearch}
      />
    </div>
  );
}
