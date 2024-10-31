import React, { useEffect, useState } from "react";
import {
  Table,
  Input,
  Button,
  Modal,
  Form,
  Upload,
  Select,
  message,
} from "antd";
import { supabase } from "../config/supabaseClient";
import Sidebar from "../components/Sidebar";
import withAuth from "../components/withAuth";
import * as XLSX from "xlsx";

const cityOptions = [
  "Өлгий сум",
  "Алтай сум",
  "Алтанцөгц сум",
  "Баяннуур сум",
  "Бугат сум",
  "Булган сум",
  "Буянт сум",
  "Дэлүүн сум",
  "Ногооннуур сум",
  "Сагсай сум",
  "Толбо сум",
  "Улаанхус сум",
  "Цагааннуур (тосгон)",
  "Цэнгэл сум",
];

const awardTypeOptions = [
  "Салбарын шагнал",
  "Алтан гадас",
  "Хөдөлмөрийн хүндэт медаль",
  "ХГУТО",
  "ЦГУТО",
  "Цэргийн хүндэт медаль",
];

const Award = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [error, setError] = useState(null);
  const [filterName, setFilterName] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [noDataFound, setNoDataFound] = useState(false); // State for no data found message

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const { data, error } = await supabase.from("Award").select("*");
        if (error) throw error;
        setRequests(data);
        setFilteredRequests(data); // Set filtered requests initially
        setNoDataFound(false); // Reset no data found state
      } catch (error) {
        message.error(error.message); // Display error message
      }
    };

    fetchRequests();
  }, []);

  const handleFilter = () => {
    let filtered = requests;

    // Filter by Name
    if (filterName) {
      filtered = filtered.filter((request) =>
        request.name.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    // Filter by City
    if (filterCity) {
      filtered = filtered.filter((request) =>
        request.city.toLowerCase().includes(filterCity.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
    setNoDataFound(filtered.length === 0); // Set no data found state based on filtered results
  };

  // Watch for changes in filter values to reset table if filters are cleared
  useEffect(() => {
    if (!filterName && !filterCity) {
      setFilteredRequests(requests); // Reset filtered requests to show all data
      setNoDataFound(false); // Reset no data found state
    }
  }, [filterName, filterCity, requests]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const { error } = await supabase.from("Award").insert([values]);

      if (error) {
        message.error(error.message);
      } else {
        message.success("Шагнал амжилттай нэмэгдлээ");
        setIsModalVisible(false);
        form.resetFields();
        setRequests((prevRequests) => [...prevRequests, values]);
        setFilteredRequests((prevRequests) => [...prevRequests, values]); // Update filtered requests too
      }
    } catch (err) {
      message.error("Баталгаажуулахдаа алдаа гарлаа");
    }
  };

  const handleExport = () => {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filteredRequests);
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Requests");
    XLSX.writeFile(wb, "Filtered_Awards.xlsx");
  };

  const columns = [
    {
      title: "Шагналын ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "РД",
      dataIndex: "register_number",
      key: "register_number",
    },
    {
      title: "Овог",
      dataIndex: "surname",
      key: "surname",
    },
    {
      title: "Нэр",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Яс Үндэс",
      dataIndex: "yas_undes",
      key: "yas_undes",
    },
    {
      title: "Аймаг Сум",
      dataIndex: "city",
      key: "city",
    },
    {
      title: "Шагналын Төрөл",
      dataIndex: "type_of_award",
      key: "type_of_award",
    },
    {
      title: "Утасны Дугаар",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Бүртгэгдсэн Өдөр",
      dataIndex: "created_at",
      key: "created_at",
    },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-4">
        <h1 className="text-2xl font-bold mb-4">Шагналууд</h1>

        <div
          className="filter-section"
          style={{
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <Input
              placeholder="Нэр"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              style={{ width: "200px", marginRight: "10px" }}
            />
            <Select
              placeholder="Аймаг Сум"
              value={filterCity}
              onChange={(value) => setFilterCity(value)}
              style={{ width: "200px", marginRight: "10px" }}
            >
              {cityOptions.map((city, index) => (
                <Select.Option key={index} value={city}>
                  {city}
                </Select.Option>
              ))}
            </Select>
            <Button onClick={handleFilter} type="default">
              Шүүх
            </Button>
          </div>
          <div>
            <Button
              type="default"
              onClick={() => setIsModalVisible(true)}
              style={{ marginLeft: "20px" }}
              disabled={false} // Disable based on form validation if needed
            >
              Шагнал Нэмэх
            </Button>
            <Button
              type="default"
              onClick={handleExport}
              style={{ marginLeft: "20px" }}
              disabled={filteredRequests.length === requests.length}
            >
              Татаж авах
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto" style={{ marginTop: "16px" }}>
          <Table
            columns={columns}
            dataSource={filteredRequests}
            rowKey="id"
            locale={{ emptyText: "Data not found" }}
          />
        </div>

        <Modal
          title="Шинэ Шагнал"
          open={isModalVisible}
          onOk={handleSave}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
          }} // Clear fields on close
          okText="Хадгалах"
          okType="default"
          cancelText="Болих"
        >
          <Form form={form} layout="vertical">
            <Form.Item
              label="Нэр"
              name="name"
              rules={[{ required: true, message: "Нэр оруулна уу" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Овог"
              name="surname"
              rules={[{ required: true, message: "Овог оруулна уу" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="РД"
              name="register_number"
              rules={[{ required: true, message: "РД оруулна уу" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Утасны Дугаар"
              name="phone_number"
              rules={[{ required: true, message: "Утасны дугаар оруулна уу" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Аймаг Сум"
              name="city"
              rules={[{ required: true, message: "Аймаг Сум сонгоно уу" }]}
            >
              <Select placeholder="Сонгоно уу">
                {cityOptions.map((city, index) => (
                  <Select.Option key={index} value={city}>
                    {city}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Шагналын Төрөл"
              name="type_of_award"
              rules={[
                { required: true, message: "Шагналын төрлийг сонгоно уу" },
              ]}
            >
              <Select placeholder="Сонгоно уу">
                {awardTypeOptions.map((type, index) => (
                  <Select.Option key={index} value={type}>
                    {type}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Шагналын Зураг">
              <Upload beforeUpload={() => false}>
                {" "}
                {/* Prevent automatic upload */}
                <Button>Файл сонгох</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default withAuth(Award);
