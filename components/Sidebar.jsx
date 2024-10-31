import React from "react";
import Link from "next/link";
import { MdSpaceDashboard } from "react-icons/md";
import { IoPersonSharp } from "react-icons/io5";
import { IoMedalOutline } from "react-icons/io5";
import { IoDocumentsOutline } from "react-icons/io5";
const Sidebar = ({ children }) => {
  return (
    <div className="flex">
      <div className="fixed w-20 h-screen p-4 bg-white border-r-[1px] flex flex-col justify-between">
        <div className="flex flex-col items-center">
          <Link href="/">
            <div className="bg-purple-800 text-white p-3 rounded-lg inline-block">
              <IoPersonSharp size={20} />
            </div>
          </Link>
          <span className="border-b-[1px] border-gray-200 w-full p-2"></span>
          <Link href="/Requests">
            <div className="bg-gray-100 hover:bg-gray-200 cursor-pointer my-4 p-3 rounded-lg inline-block">
              <IoDocumentsOutline size={20} />
            </div>
          </Link>
          <Link href="/Award">
            <div className="bg-gray-100 hover:bg-gray-200 cursor-pointer my-4 p-3 rounded-lg inline-block">
              <IoMedalOutline size={20} />
            </div>
          </Link>
        </div>
      </div>
      <main className="ml-20 w-full">{children}</main>
    </div>
  );
};

export default Sidebar;
