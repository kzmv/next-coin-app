import { signIn } from "next-auth/react";
import { Button } from "react-bootstrap";
import { FaGithub } from "react-icons/fa";
import styles from "./access-denied.module.css";

export default function AccessDenied() {
    return (
        <div className={styles.conainter}>
            <h1>Welcome!</h1>
            <div>You must be signed in to view this page</div>
            <div>
                <Button
                    variant="primary"
                    onClick={(e) => {
                        e.preventDefault();
                        window.location.href =
                            "https://github.com/kzmv/next-coin-app";
                    }}
                >
                    <FaGithub />
                    GitHub
                </Button>{" "}
            </div>
        </div>
    );
}
