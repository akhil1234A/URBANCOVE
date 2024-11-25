import { Layout, Menu } from 'antd';
import { UserOutlined, AppstoreOutlined, ShoppingOutlined, FileTextOutlined, TagsOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar = () => {

  const menuItems = [
    {
      key: 'sub1',
      icon: <UserOutlined />,
      label: 'User Management',
      children: [
        { key: '1', label: <Link to="/admin/users">View Users</Link> },
      ],
    },
    {
      key: 'sub2',
      icon: <AppstoreOutlined />,
      label: 'Category Management',
      children: [
        { key: '2', label: <Link to="/admin/categories">View Categories</Link> },
        { key: '3', label: <Link to="/admin/subcategories">View Sub Categories</Link> },
      ],
    },
    {
      key: 'sub3',
      icon: <ShoppingOutlined />,
      label: 'Product Management',
      children: [
        { key: '4', label: <Link to="/admin/products/add">Add Product</Link> },
        { key: '5', label: <Link to="/admin/products/view">View Products</Link> },
      ],
    },
    {
      key: 'sub4', 
      icon: <FileTextOutlined />, 
      label: 'Orders Management',
      children: [
        { key: '6', label: <Link to="/admin/orders">View Orders</Link> }
      ],
    },
    {
      key: 'sub5', 
      icon: <TagsOutlined />, 
      label: 'Offers Management',
      children: [
        { key: '7', label: <Link to="/admin/offers">View Offers</Link> },
        { key: '8', label: <Link to="/admin/offers/create-offer">Create Offer</Link> },
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
        items={menuItems} 
      />
    </Sider>
  );
};

export default Sidebar;
