import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

export default function Contact({ listing }) {
    const [landlord, setLandlord] = useState(null);
    const [message, setMessage] = useState("");

    const onChange = (e) => setMessage(e.target.value);

    useEffect(() => {
        const fetchLandlord = async () => {
            try {
                const res = await fetch(`/api/user/${listing.userRef}`);
                if (!res.ok) throw new Error("Failed to fetch landlord");
                const data = await res.json();
                setLandlord(data);
            } catch (error) {
                console.error(error);
            }
        };
        fetchLandlord();
    }, [listing.userRef]);

    return (
        <>
            {landlord && (
                <div className="flex flex-col gap-2">
                    <p>
                        Contact{" "}
                        <span className="font-semibold">
                            {landlord.username}
                        </span>{" "}
                        for{" "}
                        <span className="font-semibold">
                            {listing.name.toLowerCase()}
                        </span>
                    </p>
                    <textarea
                        name="message"
                        id="message"
                        rows="2"
                        value={message}
                        onChange={onChange}
                        placeholder="Enter your message here..."
                        className="w-full border p-3 rounded-lg"
                    />
                    <Link
                        to={`mailto:${
                            landlord.email
                        }?subject=${encodeURIComponent(
                            `Regarding ${listing.name}`
                        )}&body=${encodeURIComponent(message)}`}
                        className="bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95">
                        Send Message
                    </Link>
                </div>
            )}
        </>
    );
}

// ✅ Prop validation
Contact.propTypes = {
    listing: PropTypes.shape({
        name: PropTypes.string.isRequired,
        userRef: PropTypes.string.isRequired,
    }).isRequired,
};
