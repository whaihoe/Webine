import { Link } from "react-router-dom";

export function WebineBrand() {
  return (
    <Link className="webine-brand" to="/" aria-label="Webine home">
      <img
        className="webine-brand__mark"
        src="/webine-logo-primary.png"
        alt=""
        width="174"
        height="103"
      />
      <span className="webine-brand__wordmark">Webine</span>
    </Link>
  );
}
