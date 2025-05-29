import React, { useEffect, useState } from "react";
import { Form, Input, Select, Button, Upload, message, Checkbox } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import axios from "axios";

const { Option } = Select;

const AddTeaForm = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [imageUrl, setImageUrl] = useState("");
  const apiURL = process.env.REACT_APP_API_URL
  // 获取分类列表
  const [classifyList, setClassifyList] = useState([]);
  useEffect(() => {
    axios.get(`${apiURL}/classify/get`)
      .then((res) => {
        setClassifyList(res.data || []);
      })
      .catch(() => {
        message.error("分类列表获取失败");
      })
  }, [apiURL])

  // 获取小料列表
  const [toppingsList, setToppingsList] = useState([]);
  useEffect(() => {
    axios.get(`${apiURL}/toppings/get`)
      .then((res) => {
        setToppingsList(res.data || []);
      })
      .catch(() => {
        message.error("小料列表获取失败");
      })
  }, [apiURL])

  const handleUpload = (info) => {
    if (info.file.status === "done") {
      // 后端返回图片路径在 res.data.image_url
      const url = info.file.response.image_url || info.file.response;
      console.log(apiURL + url);
      setImageUrl(apiURL + url);
      message.success("图片上传成功");
    } else if (info.file.status === "error") {
      message.error("上传失败");
    }
  };

  const onFinish = (values) => {
    const payload = {
      ...values,
      fixedAddons: values.fixedAddons?.join(",") || "",
      teaImage: imageUrl,
    };

    axios
      .post(`${apiURL}/tea/add`, payload)
      .then(() => {
        message.success("茶饮添加成功");
        form.resetFields();
        setImageUrl("");
        if (onSuccess) {
          onSuccess(); // 调用父组件传来的方法
        }
      })
      .catch(() => {
        message.error("添加失败");
      });
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      style={{ maxWidth: 600, margin: "0 auto" }}
    >
      <Form.Item
        label="茶饮名称"
        name="teaName"
        rules={[{ required: true, message: "请输入茶饮名称" }]}
      >
        <Input placeholder="例如：红豆奶茶" />
      </Form.Item>

      <Form.Item
        label="分类"
        name="classifyId"
        rules={[{ required: true, message: "请选择分类" }]}
      >
        <Select placeholder="请选择分类">
          {classifyList.map(item => (
            <Option key={item.classifyId} value={item.classifyId}>
              {item.classifyName}
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item label="固定小料" name="fixedAddons">
        <Checkbox.Group>
          {toppingsList.map(item=>(
            <Checkbox key={item.toppingId} value={item.toppingName}>{item.toppingName}</Checkbox>
          ))}
        </Checkbox.Group>
      </Form.Item>

      <Form.Item
        label="茶底"
        name="teaBase"
        rules={[{ required: true, message: "请选择茶底" }]}
      >
        <Select placeholder="请选择茶底">
          <Option value="红茶">红茶</Option>
          <Option value="绿茶">绿茶</Option>
          <Option value="乌龙茶">乌龙茶</Option>
          <Option value="茉莉花茶">茉莉花茶</Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="价格（元）"
        name="price"
        rules={[{ required: true, message: "请输入价格" }]}
      >
        <Input type="number" min={0} step={0.01} />
      </Form.Item>

      <Form.Item
        label="茶饮图片"
        name="teaImage"
        valuePropName="file"
        getValueFromEvent={(e) => e}
      >
        <Upload
          name="file"
          action="http://localhost:8090/upload/" // 上传图片的接口
          listType="picture"
          onChange={handleUpload}
          showUploadList={false}
        >
          <Button icon={<UploadOutlined />}>点击上传图片</Button>
          {imageUrl && (
            <div style={{ marginTop: 10 }}>
              <img src={imageUrl} alt="预览" style={{ width: 100 }} />
            </div>
          )}
        </Upload>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          确认添加
        </Button>
      </Form.Item>
    </Form>
  );
};

export default AddTeaForm;