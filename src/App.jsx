import axios from "axios";
import { useState, useEffect } from "react";

function App() {
  const [account, setAccount] = useState({
    username: "example@test.com",
    password: "example",
  });
  const [isAuth, setIsAuth] = useState(false);
  // const [token, setToken] = useState("");
  const [products, setProduct] = useState([]);
  const [initialProduct, setInitialProduct] = useState({});
  const [message, setMessage] = useState("");
  const [editing, setEditing] = useState(false);

  function handleInput(e) {
    // console.log(e.target.name);
    // console.log(e.target.value);
    const { name, value } = e.target;
    setAccount({
      ...account,
      [name]: value,
    });
  }

  const baseUrl = import.meta.env.VITE_BASE_URL;
  const apiPath = import.meta.env.VITE_API_PATH;

  //在外部定義axios的全域token
  const applyToken = (token) => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
    }
  };

  async function handleLogin(e) {
    e.preventDefault();
    // console.log(account);
    try {
      const res = await axios.post(`${baseUrl}/v2/admin/signin`, account);
      console.log(res.data);
      const { token, expired } = res.data;
      document.cookie = `Token=${token}; expires=${new Date(expired)}`;
      // console.log(document.cookie);
      applyToken(token);
      setIsAuth(true);
      //登入後馬上取得資料
      getProduct();
      alert("登入成功");
    } catch (err) {
      console.log(err);
      setIsAuth(false);
      alert(`${err.response?.data?.message}`);
    }
  }

  async function getProduct() {
    try {
      const res = await axios.get(
        `${baseUrl}/v2/api/${apiPath}/admin/products`
      );
      console.log(res.data.products);
      setProduct(res.data.products);
    } catch (error) {
      console.log(error);
      alert(`取得商品失敗，${error.response?.data.message}`);
    }
  }

  async function checkLogin() {
    try {
      await axios.post(`${baseUrl}/v2/api/user/check`, {});
      // console.log(res.data);
      setEditing(false);
      setMessage("驗證成功");
    } catch (error) {
      // console.log(error);
      setMessage("驗證失敗", error);
      setEditing(true);
      setIsAuth(false);
    }
  }

  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("Token="))
      ?.split("=")[1];

    if (token) {
      applyToken(token); // 呼叫同一個函式
      getProduct();
    }
    //只要有重整，都要拿得到token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isAuth ? (
        <div className="container mt-5">
          <div className="row">
            <div className="col-3">
              <button
                type="button"
                className="btn btn-success mb-3 fw-bold"
                onClick={checkLogin}
              >
                驗證登入
              </button>
              {message && (
                <p
                  className={`mt-3 ${editing ? "text-danger" : "text-success"}`}
                >
                  {message}
                </p>
              )}
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <h2>產品列表</h2>
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th scope="col">產品名稱</th>
                    <th scope="col" className="text-center">
                      原價
                    </th>
                    <th scope="col" className="text-center">
                      售價
                    </th>
                    <th scope="col" className="text-center">
                      是否啟用
                    </th>
                    <th scope="col" className="text-center">
                      查看細節
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    return (
                      <tr key={product.id}>
                        <th>{product.title}</th>
                        <td className="text-center">{product.origin_price}</td>
                        <td className="text-center">{product.price}</td>
                        <td className="text-center">
                          {product.is_enabled ? "是" : "否"}
                        </td>
                        <td className="text-center">
                          <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => {
                              setInitialProduct(product);
                            }}
                          >
                            查看細節
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="col-md-6">
              <h2>單一產品細節</h2>
              {initialProduct.title ? (
                <div className="card">
                  <img
                    src={initialProduct.imageUrl}
                    className=" img-fluid object-fit-cover d-block mx-auto"
                    style={{
                      height: "400px",
                      width: "auto",
                      maxWidth: "100%",
                    }}
                    alt={initialProduct.title}
                  />
                  <div className="card-body">
                    <h5 className="card-title">
                      {initialProduct.title}
                      <span className="badge bg-primary ms-2">
                        {initialProduct.category}
                      </span>
                    </h5>
                    <p className="card-text">
                      商品描述：{initialProduct.description}
                    </p>
                    <p className="card-text">
                      商品內容：{initialProduct.content}
                    </p>
                    <p className="card-text">
                      <del className="text-muted">
                        {initialProduct.origin_price}元
                      </del>{" "}
                      / {initialProduct.price}元
                    </p>
                    <h5>更多圖片</h5>
                    {initialProduct.imagesUrl?.map((image, index) => {
                      return (
                        image && (
                          <img
                            className="img-fluid object-fit-cover mb-2"
                            src={image}
                            key={index}
                          />
                        )
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-muted">請選擇一個商品查看</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100">
          <h1 className="mb-5">請先登入</h1>
          <form
            className="d-flex flex-column gap-3 w-100"
            style={{ maxWidth: "500px" }}
            onSubmit={handleLogin}
          >
            <div className="form-floating mb-3 ">
              <input
                type="email"
                className="form-control "
                id="username"
                name="username"
                value={account.username}
                placeholder="name@example.com"
                onChange={handleInput}
              />
              <label htmlFor="username">Email address</label>
            </div>
            <div className="form-floating">
              <input
                type="password"
                className="form-control"
                id="password"
                name="password"
                value={account.password}
                placeholder="Password"
                onChange={handleInput}
              />
              <label htmlFor="password">Password</label>
            </div>
            <button className="btn btn-primary">登入</button>
          </form>
          <p className="mt-5 mb-3 text-muted">&copy; 2025~∞ - 六角學院</p>
        </div>
      )}
    </>
  );
}

export default App;
