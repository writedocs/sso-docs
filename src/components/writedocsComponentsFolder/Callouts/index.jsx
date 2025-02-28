import React from "react";
import "./callouts.css";
import Danger from "./types/Danger";
import Info from "./types/Info";
import Note from "./types/Note";
import Success from "./types/Success";
import Support from "./types/Support";
import Training from "./types/Training";
import Transpara from "./types/Transpara";
import Warning from "./types/Warning";

export default function Callout({ children, type, title }) {
  if (type === "info") {
    return <Info title={title} children={children} />;
  }

  if (type === "tip" || type === "success") {
    return <Success title={title} children={children} />;
  }

  if (type === "warning") {
    return <Warning title={title} children={children} />;
  }

  if (type === "danger") {
    return <Danger title={title} children={children} />;
  }

  if (type === "transpara") {
    return <Transpara title={title} children={children} />;
  }

  if (type === "support") {
    return <Support title={title} children={children} />;
  }

  if (type === "training") {
    return <Training title={title} children={children} />;
  }

  return <Note title={title} children={children} />;
}
