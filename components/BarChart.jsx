import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import { supabase } from "../config/supabaseClient";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = () => {
  const [chartData, setChartData] = useState({
    datasets: [],
  });

  const [chartOptions, setChartOptions] = useState({});

  useEffect(() => {
    const fetchWeeklyData = async () => {
      const today = new Date();
      const startOfWeek = new Date(
        today.setDate(today.getDate() - today.getDay() + 1)
      );
      startOfWeek.setHours(0, 0, 0, 0); // Start of Monday

      // Convert startOfWeek to ISO date format (YYYY-MM-DD)
      const isoStartOfWeek = startOfWeek.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("sanal_khuselt")
        .select("created_at")
        .gte("created_at", isoStartOfWeek);

      if (error) {
        console.error("Error fetching data:", error);
        return;
      }

      const dayCounts = Array(7).fill(0); // Monday = 0, Sunday = 6

      data.forEach((entry) => {
        const createdAt = new Date(entry.created_at);
        const dayOfWeek = createdAt.getDay();
        const index = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        dayCounts[index]++;
      });

      // Set the chart data with day counts
      setChartData({
        labels: [
          "Даваа",
          "Мягмар",
          "Лхагва",
          "Пүрэв",
          "Баасан",
          "Бямба",
          "Ням",
        ],
        datasets: [
          {
            label: "Өргөлдлүүд",
            data: dayCounts,
            borderColor: "rgb(53, 162, 235)",
            backgroundColor: "rgba(53, 162, 235, 0.4)",
          },
        ],
      });

      setChartOptions({
        plugins: {
          legend: {
            position: "top",
          },
          title: {
            display: true,
            text: "Энэ долоо хоног",
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 10, // Maximum value on the y-axis
            ticks: {
              stepSize: 1,
            },
          },
        },
        maintainAspectRatio: false,
        responsive: true,
      });
    };

    fetchWeeklyData();
  }, []);

  return (
    <>
      <div className="w-full md:col-span-2 relative lg:h-[70vh] h-[50vh] m-auto p-4 border rounded-lg bg-white">
        <Bar data={chartData} options={chartOptions} />
      </div>
    </>
  );
};

export default BarChart;
