import React from 'react';
import { Layout, Menu } from 'antd';
import { UserOutlined, AppstoreOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = () => {
  // Define menu items array with nested children
  const menuItems = [
    {
      key: 'sub1',
      icon: <UserOutlined />,
      label: 'User Management',
      children: [
        { key: '1', label: <Link to="/admin/dashboard/users">View Users</Link> },
      ],
    },
    {
      key: 'sub2',
      icon: <AppstoreOutlined />,
      label: 'Category Management',
      children: [
        { key: '2', label: <Link to="/admin/dashboard/categories">View Categories</Link> },
        { key: '3', label: <Link to="/admin/dashboard/subcategories">View Sub Categories</Link> },
      ],
    },
    {
      key: 'sub3',
      icon: <ShoppingOutlined />,
      label: 'Product Management',
      children: [
        { key: '4', label: <Link to="/admin/dashboard/products/add">Add Product</Link> },
        { key: '5', label: <Link to="/admin/dashboard/products/view">View Products</Link> },
      ],
    },
  ];

  return (
    <Sider
      width={200}
      style={{
        backgroundColor: '#001529',
        padding: 0,
        height: '100vh',
        position: 'fixed',
        top: 70,
        left: 0,
        zIndex: 1,
      }}
    >
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={['1']}
        style={{ margin: 0, padding: 0 }}
        items={menuItems} // Pass menu items as items prop
      />
    </Sider>
  );
};

export default Sidebar;
