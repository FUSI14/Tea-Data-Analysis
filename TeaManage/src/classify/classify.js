import React, { useEffect, useState } from "react";
import { Table, Button, Space, message, Modal, Form, Input } from "antd";
import axios from "axios";
import { PlusOutlined } from '@ant-design/icons';

function Classify() {
  const [dataSource, setDataSource] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const apiURL = process.env.REACT_APP_API_URL;

  // 获取分类数据
  const loadClassifyList = () => {
    setLoading(true);
    axios.get(`${apiURL}/classify/get`)
      .then((res) => {
        const data = res.data.map(item => ({
          classifyID: item.classifyId,
          classifyName: item.classifyName,
        }));
        setDataSource(data);
      })
      .catch(() => {
        message.error("获取分类数据失败");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    loadClassifyList();
  }, [apiURL]);

  // 添加分类弹窗
  const [isModalOpen_add, setisModalOpen_add] = useState(false);
  const showAdd = () => setisModalOpen_add(true);
  const handleAddCancel = () => setisModalOpen_add(false);

  const onFinishAdd = (values) => {
    axios.post(`${apiURL}/classify/add`, values)
      .then(() => {
        message.success("分类添加成功");
        form.resetFields();
        setisModalOpen_add(false);
        loadClassifyList();
      })
      .catch(() => {
        message.error("添加失败");
      });
  };

  // 编辑分类弹窗
  const [editVisible, setEditVisible] = useState(false);
  const [editData, setEditData] = useState(null);

  const handleEdit = (record) => {
    setEditData(record);
    setEditVisible(true);
    editForm.setFieldsValue({ classifyName: record.classifyName });
  };

  const handleEditCancel = () => {
    setEditVisible(false);
    editForm.resetFields();
  };

  const onEditFinish = (values) => {
    axios.put(`${apiURL}/classify/${editData.classifyID}`, values)
      .then(() => {
        message.success("分类更新成功");
        setEditVisible(false);
        loadClassifyList();
      })
      .catch(() => {
        message.error("更新失败");
      });
  };

  // 删除分类弹窗
  const [ifDelete, setIfDelete] = useState(false);
  const [selectedID, setSelectedID] = useState(null);

  const handleDelete = (record) => {
    setSelectedID(record.classifyID);
    setIfDelete(true);
  };

  const deleteCancel = () => {
    setIfDelete(false);
    setSelectedID(null);
  };

  const deleteConfirm = () => {
    axios.delete(`${apiURL}/classify/${selectedID}`)
      .then(() => {
        message.success("删除成功！");
        loadClassifyList();
      })
      .catch(() => {
        message.error("删除失败");
      })
      .finally(() => {
        setIfDelete(false);
        setSelectedID(null);
      });
  };

  const columns = [
    {
      title: "编号",
      dataIndex: "classifyID",
      key: "classifyID",
    },
    {
      title: "分类名称",
      dataIndex: "classifyName",
      key: "classifyName",
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record)}>修改</Button>
          <Button danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div className="right">
        <Button type="primary" onClick={showAdd} icon={<PlusOutlined />}>新增分类</Button>
      </div>
      <Table
        dataSource={dataSource}
        columns={columns}
        rowKey="classifyID"
        loading={loading}
      />

      {/* 新增分类弹窗 */}
      <Modal
        title="新增分类"
        open={isModalOpen_add}
        onCancel={handleAddCancel}
        footer={null}
        closable={true}
      >
        <Form form={form} onFinish={onFinishAdd}>
          <Form.Item label="分类名称" name="classifyName" rules={[{ required: true, message: "请输入分类名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">确认添加</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑分类弹窗 */}
      <Modal
        title="更新分类信息"
        open={editVisible}
        onCancel={handleEditCancel}
        footer={null}
        closable={true}
      >
        <Form form={editForm} onFinish={onEditFinish}>
          <Form.Item label="分类名称" name="classifyName" rules={[{ required: true, message: "请输入分类名称" }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">确认更新</Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* 删除确认弹窗 */}
      <Modal
        title="是否确定删除？"
        open={ifDelete}
        onCancel={deleteCancel}
        footer={null}
        closable={true}
      >
        <div className="center-flex">
          <Button danger type="primary" onClick={deleteConfirm}>确定</Button>&nbsp;&nbsp;&nbsp;&nbsp;
          <Button onClick={deleteCancel}>取消</Button>
        </div>
      </Modal>
    </div>
  );
}

export default Classify;
