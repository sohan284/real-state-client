import { Button, Dropdown, Layout, Space } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import SideBar from "./SideBar";
import { FaChevronDown, FaRegUserCircle } from "react-icons/fa";
import { useAppDispatch } from "../redux/hooks";
import { logOut, selectCurrentUser } from "../redux/fetures/auth/authSlice";
import { useSelector } from "react-redux";
import authApi from "../redux/fetures/auth/authApi";
import { url } from "../globalConst/const";

const { Header, Content } = Layout;

const MainLayout = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch();
  const handleLOgout = () => {
    navigate("/signin")
    dispatch(logOut());
  };

  const currentUser = useSelector(selectCurrentUser);
  const { data } = authApi.useGetSingleUserInfoQuery(currentUser?.email);

  // console.log(`https://backend.rentpadhomes.com${data?.data?.profileImage}`);
  // console.log(data?.data);

  const items = [
    // {
    //   label: (
    //     <a target="_blank" rel="noopener noreferrer">
    //       1st menu
    //     </a>
    //   ),
    //   key: "0",
    // },
    // {
    //   label: (
    //     <a target="_blank" rel="noopener noreferrer">
    //       2nd menu
    //     </a>
    //   ),
    //   key: "1",
    // },
    // {
    //   type: "divider",
    // },
    {
      label: (
        <Button onClick={handleLOgout} className="w-full">
          LogOut
        </Button>
      ),
      key: "3",
    },
  ];


  return (
    <div className="">
      <Layout style={{ height: "100%" }}>
        <SideBar />
        <Layout>
          <Header className="flex justify-end items-center bg-white p-4">
            <div className="flex items-center mr-5 ">
              {
                data?.data?.profileImage ?
                  <img src={`${url}${data?.data?.profileImage}`} className="size-10 rounded-full cursor-pointer" alt="" />
                  :
                  <FaRegUserCircle className="size-10 rounded-full" />
              }
              <div className="title px-4 py-2 rounded-lg flex-shrink-0">
                <h2 className="text-xl font-semibold">{data?.data?.name}</h2>
                <h2 className="text-sm">{currentUser?.email}</h2>
              </div>
            </div>
            <Dropdown
              menu={{
                items,
              }}
              trigger={["click"]}
            >
              <a
                onClick={(e) => e.preventDefault()} 
                className="flex items-center"
              >
                <Space>
                  <FaChevronDown />
                </Space>
              </a>
            </Dropdown>
          </Header>
          <Content style={{ margin: "24px 16px 0" }}>
            <div
              style={{
                padding: 24,
                minHeight: 360,
              }}
            >
              <Outlet />
            </div>
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};

export default MainLayout;
