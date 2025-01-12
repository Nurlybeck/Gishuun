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
  const [filterName, setFilterName] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data: requests, error } = await supabase
      .from("Award")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) {
      setRequests(requests);
      setFilteredRequests(requests);
    }
  };

  const handleFilter = () => {
    let filtered = requests;

    if (filterName) {
      filtered = filtered.filter((request) =>
        request.name?.toLowerCase().includes(filterName.toLowerCase())
      );
    }

    if (filterCity) {
      filtered = filtered.filter((request) =>
        request.City?.toLowerCase().includes(filterCity.toLowerCase())
      );
    }

    setFilteredRequests(filtered);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      const uploadedFiles = [];
      for (const file of fileList) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "uploads");
        formData.append("fileName", `${Date.now()}-${file.name}`);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (response.ok && result.fileUrl) {
          uploadedFiles.push(result.fileUrl);
        } else {
          console.error("File upload failed:", result.error);
          return;
        }
      }

      const { error } = await supabase
        .from("Award")
        .insert([{ ...values, extras: uploadedFiles.join(", ") }]);

      if (!error) {
        setIsModalVisible(false);
        form.resetFields();
        setFileList([]);
        fetchRequests();
      } else {
        console.error("Failed to save award data:", error.message);
      }
    } catch (err) {
      console.error("Error during save:", err);
    }
  };

  const handleFileChange = (info) => {
    setFileList(info.fileList.map((file) => file.originFileObj || file));
  };

  const handleExport = () => {
    const columnMapping = {
      id: "Шагналын ID",
      type_of_award: "Шагналын Төрөл",
      register_number: "РД",
      surname: "Овог",
      name: "Нэр",
      yas_undes: "Яс Үндэс",
      city: "Аймаг Сум",
      phone_number: "Утасны Дугаар",
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

  const columns = [
    { title: "Шагналын ID", dataIndex: "id", key: "id" },
    {
      title: "Шагналын Төрөл",
      dataIndex: "type_of_award",
      key: "type_of_award",
    },
    { title: "РД", dataIndex: "register_number", key: "register_number" },
    { title: "Овог", dataIndex: "surname", key: "surname" },
    { title: "Нэр", dataIndex: "name", key: "name" },
    { title: "Яс Үндэс", dataIndex: "yas_undes", key: "yas_undes" },
    { title: "Аймаг Сум", dataIndex: "city", key: "city" },
    { title: "Утасны Дугаар", dataIndex: "phone_number", key: "phone_number" },
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
              style={{
                display: "block",
                marginBottom: "5px",
                wordBreak: "break-word",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "150px",
              }}
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
        <h1 className="text-2xl font-bold mb-4">Шагналууд</h1>
        <div className="filter-section flex gap-4 justify-between">
          <div className="flex gap-4">
            <Input
              placeholder="Нэр"
              value={filterName}
              onChange={(e) => {
                setFilterName(e.target.value);
                const value = e.target.value.trim();
                if (!value) {
                  // If both filters are cleared, reset to original data
                  setFilteredRequests(requests);
                } else {
                  handleFilter();
                }
              }}
              style={{ width: "200px" }}
            />
            <Select
              placeholder="Аймаг Сум"
              value={filterCity}
              onChange={(value) => setFilterCity(value)}
              style={{ width: "200px" }}
            >
              {cityOptions.map((city, index) => (
                <Select.Option key={index} value={city}>
                  {city}
                </Select.Option>
              ))}
            </Select>
            <Button onClick={handleFilter}>Шүүх</Button>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setIsModalVisible(true)}>Шинэ шагнал</Button>
            <Button
              onClick={handleExport}
              disabled={
                filteredRequests.length === 0 ||
                filteredRequests.length === requests.length
              }
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
          title="Шинэ шагнал"
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
            <Form.Item
              label="Нэр"
              name="name"
              rules={[{ required: true, message: "Нэрийг оруулна уу" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Овог"
              name="surname"
              rules={[{ required: true, message: "Овгийг оруулна уу" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="РД"
              name="register_number"
              rules={[
                { required: true, message: "РД-г оруулна уу" },
                {
                  pattern: /^[А-ЯӨҮ]{2}\d{8}$/,
                  message: "Зөв РД-г оруулна уу",
                },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Утасны Дугаар"
              name="phone_number"
              rules={[
                { required: true, message: "Утасны дугаарыг оруулна уу" },
                { pattern: /^\d{8}$/, message: "Зөв дугаарыг оруулна уу" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="Аймаг Сум"
              name="city"
              rules={[{ required: true, message: "Аймаг сумыг сонгоно уу" }]}
            >
              <Select>
                {cityOptions.map((city) => (
                  <Select.Option key={city} value={city}>
                    {city}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Шагналын Төрөл"
              name="type_of_award"
              rules={[{ required: true, message: "Шагналын төрөл сонгоно уу" }]}
            >
              <Select placeholder="Сонгоно уу">
                {awardTypeOptions.map((type, index) => (
                  <Select.Option key={index} value={type}>
                    {type}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              label="Яс Үндэс"
              name="yas_undes"
              rules={[{ required: true, message: "Яс үндэс оруулна уу" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item label="Нэмэлт">
              <Upload
                multiple
                fileList={fileList}
                beforeUpload={() => false}
                onChange={handleFileChange}
              >
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
