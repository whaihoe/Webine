import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { publicNavigation } from "../config/navigation";
import { ButtonLink } from "./ButtonLink";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const location = useLocation();

  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <>
      <button
        className="mobile-menu-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-menu"
        onClick={() => setOpen(true)}
      >
        Menu
        <span className="mobile-menu-trigger__mark" aria-hidden="true" />
      </button>

      <dialog
        className="mobile-menu"
        id="mobile-menu"
        ref={dialogRef}
        aria-label="Site menu"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setOpen(false);
          }
        }}
      >
        <div className="mobile-menu__panel theme-dark">
          <div className="mobile-menu__topline">
            <span className="eyebrow">Navigate / Webine</span>
            <button
              className="mobile-menu__close"
              type="button"
              onClick={() => setOpen(false)}
              autoFocus
            >
              Close
            </button>
          </div>

          <nav className="mobile-menu__navigation" aria-label="Mobile navigation">
            {publicNavigation.map((item, index) => (
              <NavLink
                key={item.href}
                className="mobile-menu__link"
                to={item.href}
                end={item.href === "/"}
                onClick={() => setOpen(false)}
              >
                <span className="mobile-menu__index">0{index + 1}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mobile-menu__action">
            <ButtonLink href="/contact" onClick={() => setOpen(false)}>
              Start a project
            </ButtonLink>
          </div>
        </div>
      </dialog>
    </>
  );
}
