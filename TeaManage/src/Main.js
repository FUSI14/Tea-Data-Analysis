import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import {
    DeleteFilled,
    HddFilled,
    StarFilled,
    SunOutlined
} from '@ant-design/icons';
import Classify from './classify/classify';
import Tea from './tea/tea';
import Toppings from './toppings/topping';

const { Header, Sider, Content } = Layout;

const Main = () => {
    const [selectedKey, setSelectedKey] = useState('1');

    // 定义每个菜单项对应的内容
    const renderContent = () => {
        switch (selectedKey) {
            case '1':
                // return <div>👤 茶饮管理内容</div>;
                return <Tea />;
            case '2':
                return <Classify />;
            case '3':
                return <Toppings />;
            default:
                return <div>欢迎使用系统</div>;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible>
                <div style={{ height: 32, margin: 16,color:'white',fontSize:'20px',fontWeight:"bold"}}>Tea Management</div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    onClick={({ key }) => setSelectedKey(key)}
                >
                    <Menu.Item key="1" icon={<DeleteFilled />}>
                        茶饮管理
                    </Menu.Item>
                    <Menu.Item key="2" icon={<HddFilled />}>
                        分类管理
                    </Menu.Item>
                    <Menu.Item key="3" icon={<StarFilled />}>
                        小料管理
                    </Menu.Item>
                </Menu>
            </Sider>

            <Layout>
                <Header style={{ background: '#fff', padding: 0, textAlign: 'center' }}>
                    <h1 style={{ margin: 0 }}>茶饮点单列表管理系统</h1>
                </Header>
                <Content style={{ margin: '16px', padding: 24, background: '#fff' }}>
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
};

export default Main;
