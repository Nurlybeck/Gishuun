import React, { useEffect, useState } from "react";
import { Table, Input, Button, Modal, Form, Upload, Select } from "antd";
import { supabase } from "../config/supabaseClient";
import withAuth from "../components/withAuth";
import Sidebar from "../components/Sidebar";
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

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [filterName, setFilterName] = useState("");
  const [filterPhoneNumber, setFilterPhoneNumber] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  // Fetch all requests initially
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data: requests, error } = await supabase
      .from("sanal_khuselt")
      .select("*");
    if (!error) {
      setRequests(requests);
      setFilteredRequests(requests); // Initialize filtered requests with all data
    }
  };

  // Watch for changes in filter values to reset table if filters are cleared
  useEffect(() => {
    if (!filterName && !filterPhoneNumber) {
      setFilteredRequests(requests);
    }
  }, [filterName, filterPhoneNumber, requests]);

  // Handle filter logic on button click
  const handleFilter = () => {
    const filteredData = requests.filter(
      (request) =>
        (!filterName || request.name === filterName) &&
        (!filterPhoneNumber || request.phone_number === filterPhoneNumber)
    );
    setFilteredRequests(filteredData);
  };

  // Handle adding new request
  const handleSave = async () => {
    const values = await form.validateFields();
    const { error } = await supabase
      .from("sanal_khuselt")
      .insert([
        { ...values, extras: fileList.map((file) => file.name).join(", ") },
      ]);

    if (!error) {
      setIsModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchRequests(); // Refresh the requests data after adding a new entry
    }
  };

  // Handle file change for document uploads
  const handleFileChange = (info) => {
    if (info.file.status === "done") {
      setFileList([...fileList, info.file.originFileObj]);
    } else if (info.file.status === "removed") {
      setFileList(fileList.filter((file) => file.name !== info.file.name));
    }
  };

  // Handle export to Excel
  const handleExport = () => {
    const columnMapping = {
      id: "Өргөдөл ID",
      register_number: "РД",
      surname: "Овог",
      name: "Нэр",
      City: "Аймаг Сум",
      phone_number: "Утасны Дугаар",
      reason: "Шалтган",
      status: "Төлөв Байдал",
      extras: "Нэмэлт",
      created_at: "Бүртгэгдсэн Өдөр",
    };

    const mappedData = filteredRequests.map((request) => {
      const mappedRequest = {};
      for (const key in columnMapping) {
        mappedRequest[columnMapping[key]] = request[key];
      }
      return mappedRequest;
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(mappedData);
    XLSX.utils.book_append_sheet(wb, ws, "Filtered Requests");
    XLSX.writeFile(wb, "Filtered_Requests.xlsx");
  };

  // Handle status change
  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from("sanal_khuselt")
      .update({ status: newStatus })
      .match({ id });

    if (!error) {
      fetchRequests(); // Refresh the requests data after updating status
    }
  };

  const columns = [
    { title: "Өргөдөл ID", dataIndex: "id", key: "id" },
    { title: "РД", dataIndex: "register_number", key: "register_number" },
    { title: "Овог", dataIndex: "surname", key: "surname" },
    { title: "Нэр", dataIndex: "name", key: "name" },
    { title: "Аймаг Сум", dataIndex: "City", key: "City" },
    { title: "Утасны Дугаар", dataIndex: "phone_number", key: "phone_number" },
    { title: "Тайлбар", dataIndex: "reason", key: "reason" },
    {
      title: "Төлөв Байдал",
      dataIndex: "status",
      key: "status",
      render: (text, record) => (
        <Select
          value={text}
          onChange={(newStatus) => handleStatusChange(record.id, newStatus)}
          style={{ width: 160 }}
        >
          <Select.Option value="Хүлээгдэж буй">Хүлээгдэж буй</Select.Option>
          <Select.Option value="Зөвшөөрсөн">Зөвшөөрсөн</Select.Option>
          <Select.Option value="Татгалзсан">Татгалзсан</Select.Option>
        </Select>
      ),
    },
    { title: "Нэмэлт", dataIndex: "extras", key: "extras" },
    { title: "Бүртгэгдсэн Өдөр", dataIndex: "created_at", key: "created_at" },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-4">
        <h1 className="text-2xl font-bold mb-4">Өргөдлүүд</h1>

        <div
          className="filter-section"
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", gap: "10px" }}>
            <Input
              placeholder="Нэр"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              style={{ width: "200px" }}
            />
            <Input
              placeholder="Утасны дугаар"
              value={filterPhoneNumber}
              onChange={(e) => setFilterPhoneNumber(e.target.value)}
              style={{ width: "200px" }}
            />
            <Button onClick={handleFilter} type="default">
              Шүүх
            </Button>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <Button type="default" onClick={() => setIsModalVisible(true)}>
              Өргөдөл Нэмэх
            </Button>
            <Button
              type="default"
              onClick={handleExport}
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
          title="Өргөдөл Нэмэх"
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="cancel" onClick={() => setIsModalVisible(false)}>
              Болих
            </Button>,
            <Button key="submit" type="default" onClick={handleSave}>
              Хадгалах
            </Button>,
          ]}
        >
          <Form form={form} layout="vertical">
            <Form.Item label="Нэр" name="name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Овог" name="surname" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item
              label="РД"
              name="register_number"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Утасны дугаар"
              name="phone_number"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Аймаг Сум"
              name="City"
              rules={[{ required: true }]}
            >
              <Select>
                {cityOptions.map((city, index) => (
                  <Select.Option key={index} value={city}>
                    {city}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Шалтгаан"
              name="reason"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Нэмэлт">
              <Upload
                beforeUpload={() => false}
                fileList={fileList}
                onChange={handleFileChange}
                multiple
              >
                <Button>Файл Нэмэх</Button>
              </Upload>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default withAuth(Requests);
