import { BrowserRouter, Route, Routes } from "react-router-dom";
import Main from "./pages/Main/Main";
import Room from "./pages/Room/Room";
import NotFound404 from "./pages/NotFound404/NotFound404";
import Registration from "./pages/Registration/Registration";
import Login from "./pages/Login/Login";

function App() {
  return (
    <div>
      <BrowserRouter>
      <Routes>
        <Route exact path='/' element={<Login/>}/>
        <Route exact path='/room/:id' element={<Room/>}/>
        <Route exact path='/registration' element={<Registration/>}/>
        <Route exact path='/home' element={<Main/>}/>
        <Route element={<NotFound404/>}/>
      </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
