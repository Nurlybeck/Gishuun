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
          (item) => item.status === "Боловсруулагдаж байгаа"
        ).length;
        const approved = data.filter(
          (item) => item.status === "Хүлээн авсан"
        ).length;
        const rejected = data.filter(
          (item) => item.status === "Буцаасан"
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
          <p className="text-gray-600">Боловсруулагдаж байгаа</p>
        </div>
        <p className="bg-yellow-200 flex justify-center items-center p-2 rounded-lg"></p>
      </div>
      <div className="bg-white flex justify-between w-full border p-4 rounded-lg">
        <div className="flex flex-col w-full pb-4">
          <p className="text-2xl font-bold">{approvedCount}</p>
          <p className="text-gray-600">Хүлээн авсан</p>
        </div>
        <p className="bg-green-200 flex justify-center items-center p-2 rounded-lg"></p>
      </div>
      <div className="bg-white flex justify-between w-full border p-4 rounded-lg">
        <div className="flex flex-col w-full pb-4">
          <p className="text-2xl font-bold">{rejectedCount}</p>
          <p className="text-gray-600">Буцаасан</p>
        </div>
        <p className="bg-red-200 flex justify-center items-center p-2 rounded-lg"></p>
      </div>
    </div>
  );
};

export default withAuth(TopCards);
