import * as React from "react";
import {createRoot} from "react-dom/client";
import {BrowserRouter, PathRouteProps, Route, Routes} from "react-router-dom";
import './normalize.css'
import './style.css'
import Overview from "./Overview";

const routes: PathRouteProps[] = [
  {
    path: '/',
    element: <Overview/>
  }
]

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <BrowserRouter>
      <Routes>
        {routes.map(route => (
          <Route key={route.path} {...route} />
        ))}
      </Routes>
  </BrowserRouter>
)