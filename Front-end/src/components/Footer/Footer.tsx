import './Footer.css'

function Footer() {
    return (
        <footer
        >
            <svg
                viewBox="0 0 385 91"
                preserveAspectRatio="xMidYMid meet"
                style={{
                    width: "100%",
                    height: "auto",
                }}
            >
                <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M0 6.72242L16.0417 3.91316C32.0833 1.10391 64.1667 -4.51459 96.25 6.72242C128.333 17.9594 160.417 46.052 192.5 51.6705C224.583 57.289 256.667 40.4334 288.75 32.0057C320.833 23.5779 352.917 23.5779 368.958 23.5779H385V91H368.958C352.917 91 320.833 91 288.75 91C256.667 91 224.583 91 192.5 91C160.417 91 128.333 91 96.25 91C64.1667 91 32.0833 91 16.0417 91H0V6.72242Z"
                    fill="#000096"
                />
            </svg>
            <div className="license">© Warrify 2025 All rights reserved</div>
        </footer>
    )
}
export default Footer