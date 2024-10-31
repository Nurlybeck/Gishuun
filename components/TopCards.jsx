// import React from "react";

// const TopCards = () => {
//   return (
//     <div className="grid lg:grid-cols-5 gap-4 p-4">
//       <div className="lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg">
//         <div className="flex flex-col w-full pb-4">
//           <p className="text-2xl font-bold">34</p>
//           <p className="text-gray-600">Шийдэгдсэн Өргөлдлүүд</p>
//         </div>
//         <p className="bg-green-200 flex justify-center items-center p-2 rounded-lg">
//           <span className="text-green-700 text-lg">85%</span>
//         </p>
//       </div>
//       <div className="lg:col-span-2 col-span-1 bg-white flex justify-between w-full border p-4 rounded-lg">
//         <div className="flex flex-col w-full pb-4">
//           <p className="text-2xl font-bold">7</p>
//           <p className="text-gray-600">Шийдэгдэгүй Өргөлдлүүд</p>
//         </div>
//         <p className="bg-green-200 flex justify-center items-center p-2 rounded-lg">
//           <span className="text-green-700 text-lg">15%</span>
//         </p>
//       </div>
//       <div className="bg-white flex justify-between w-full border p-4 rounded-lg">
//         <div className="flex flex-col w-full pb-4">
//           <p className="text-2xl font-bold">6</p>
//           <p className="text-gray-600">Энэ Сарийн Нийт Өргөлдлүүд</p>
//         </div>
//         <p className="bg-green-200 flex justify-center items-center p-2 rounded-lg"></p>
//       </div>
//     </div>
//   );
// };

// export default TopCards;

import React, { useEffect, useState } from "react";
import { supabase } from "../config/supabaseClient";
import withAuth from "../components/withAuth";

const TopCards = () => {
  const [pendingCount, setPendingCount] = useState(0);
  const [approvedCount, setApprovedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("sanal_khuselt")
        .select("status");

      if (error) {
        console.error("Error fetching data:", error);
      } else {
        const pending = data.filter(
          (item) => item.status === "Хүлээгдэж буй"
        ).length;
        const approved = data.filter(
          (item) => item.status === "Зөвшөөрсөн"
        ).length;
        const rejected = data.filter(
          (item) => item.status === "Татгалзсан"
        ).length;

        setPendingCount(pending);
        setApprovedCount(approved);
        setRejectedCount(rejected);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="grid lg:grid-cols-3 gap-4 p-4">
      <div className="bg-white flex justify-between w-full border p-4 rounded-lg">
        <div className="flex flex-col w-full pb-4">
          <p className="text-2xl font-bold">{pendingCount}</p>
          <p className="text-gray-600">Хүлээгдэж буй</p>
        </div>
        <p className="bg-yellow-200 flex justify-center items-center p-2 rounded-lg"></p>
      </div>
      <div className="bg-white flex justify-between w-full border p-4 rounded-lg">
        <div className="flex flex-col w-full pb-4">
          <p className="text-2xl font-bold">{approvedCount}</p>
          <p className="text-gray-600">Зөвшөөрсөн</p>
        </div>
        <p className="bg-green-200 flex justify-center items-center p-2 rounded-lg"></p>
      </div>
      <div className="bg-white flex justify-between w-full border p-4 rounded-lg">
        <div className="flex flex-col w-full pb-4">
          <p className="text-2xl font-bold">{rejectedCount}</p>
          <p className="text-gray-600">Татгалзсан</p>
        </div>
        <p className="bg-red-200 flex justify-center items-center p-2 rounded-lg"></p>
      </div>
    </div>
  );
};

export default withAuth(TopCards);
