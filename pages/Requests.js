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

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data: requests, error } = await supabase
      .from("sanal_khuselt")
      .select("*");
    if (!error) {
      setRequests(requests);
      setFilteredRequests(requests);
    }
  };

  const handleFilter = () => {
    const filteredData = requests.filter(
      (request) =>
        (!filterName || request.name.includes(filterName)) &&
        (!filterPhoneNumber || request.phone_number.includes(filterPhoneNumber))
    );
    setFilteredRequests(filteredData);
  };

  const handleSave = async () => {
    const values = await form.validateFields();

    const uploadedFiles = [];
    for (const file of fileList) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("bucket", "uploads");
      formData.append("fileName", `${Date.now()}-${file.name}`);

      console.log("file:", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (response.ok) {
        uploadedFiles.push(result.fileUrl);

        const { error } = await supabase
          .from("sanal_khuselt")
          .insert([{ ...values, extras: uploadedFiles.join(", ") }]);

        if (!error) {
          setIsModalVisible(false);
          form.resetFields();
          setFileList([]);
          fetchRequests();
        }

      } else {
        console.error("File upload failed:", result.error);
      }
    }

    
  };

  const handleFileChange = (info) => {
    if (info.file.status !== "uploading") {
      setFileList(info.fileList.map((file) => file.originFileObj || file));
    }
  };

  const handleExport = () => {
    const columnMapping = {
      id: "Өргөдөл ID",
      register_number: "РД",
      surname: "Овог",
      name: "Нэр",
      City: "Аймаг Сум",
      phone_number: "Утасны Дугаар",
      reason: "Шалтгаан",
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

  const handleStatusChange = async (id, newStatus) => {
    const { error } = await supabase
      .from("sanal_khuselt")
      .update({ status: newStatus })
      .match({ id });

    if (!error) {
      fetchRequests();
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
    // { title: "Нэмэлт", dataIndex: "extras", key: "extras" },
    {
      title: "Нэмэлт",
      dataIndex: "extras",
      key: "extras",
      render: (text) => {
        if (text) {
          const fileUrls = text.split(", ");
          return fileUrls.map((url, index) => (
            <a
              key={index}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", marginBottom: "5px" }}
            >
              {url}
            </a>
          ));
        }
        return null;
      },
    },    
    { title: "Бүртгэгдсэн Өдөр", dataIndex: "created_at", key: "created_at" },
  ];

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-grow p-4">
        <h1 className="text-2xl font-bold mb-4">Өргөдлүүд</h1>
        <div className="filter-section flex gap-4 justify-between">
          <div className="flex gap-4">
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
            <Button onClick={handleFilter}>Шүүх</Button>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setIsModalVisible(true)}>Өргөдөл Нэмэх</Button>
            <Button
              onClick={handleExport}
              disabled={!filteredRequests.length}
            >
              Татаж авах
            </Button>
          </div>
        </div>
        <Table
          columns={columns}
          dataSource={filteredRequests}
          rowKey="id"
          locale={{ emptyText: "Data not found" }}
          className="mt-4"
        />
        <Modal
          title="Өргөдөл Нэмэх"
          open={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            form.resetFields();
            setFileList([]);
          }}
          footer={[
            <Button key="cancel" onClick={() => setIsModalVisible(false)}>
              Болих
            </Button>,
            <Button key="submit" onClick={handleSave}>
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
            <Form.Item label="Аймаг Сум" name="City" rules={[{ required: true }]}>
              <Select>
                {cityOptions.map((city) => (
                  <Select.Option key={city} value={city}>
                    {city}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item label="Шалтгаан" name="reason" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
            <Form.Item label="Нэмэлт">
              <Upload
                beforeUpload={() => false}
                fileList={fileList.map((file) => ({
                  uid: file.uid || file.name,
                  name: file.name,
                }))}
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
