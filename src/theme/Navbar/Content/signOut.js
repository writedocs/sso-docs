// supabase sign out
import React, { useState, useEffect } from "react";
import supabase from "../../../utils/supabase/client";
import { getLoginPainelStatus } from "../../../utils/supabase/loginPainel";

// permita a passagem de className
export default function SignOut() {
	// State to hold the statuses
	const [loginPainelEnabled, setLoginPainelEnabled] = useState(false);
	const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
	const [isLoading, setIsLoading] = useState(true); // Add loading state

	// Effect to fetch statuses on component mount
	useEffect(() => {
		async function checkStatuses() {
			setIsLoading(true);
			try {
				const panelStatus = await getLoginPainelStatus();
				setLoginPainelEnabled(panelStatus);

				if (panelStatus) {
					// Only check session if panel is enabled
					const { data, error } = await supabase.auth.getSession();
					if (error) {
						console.error("Error fetching session:", error);
						setIsUserLoggedIn(false);
					} else {
						setIsUserLoggedIn(data.session !== null);
					}
				} else {
					setIsUserLoggedIn(false); // If panel is not enabled, user is effectively not logged in for this feature
				}
			} catch (error) {
				console.error("Error checking statuses:", error);
				setLoginPainelEnabled(false);
				setIsUserLoggedIn(false);
			} finally {
				setIsLoading(false);
			}
		}

		checkStatuses();
	}, []); // Empty dependency array ensures this runs only once on mount

	// Don't render anything while loading to avoid flicker
	if (isLoading) {
		return null;
	}

	// Render the button only if the panel is enabled AND the user is logged in
	if (!loginPainelEnabled || !isUserLoggedIn) {
		return null;
	}

	return (
		<button
			className='wd_signout_btn'
			onClick={async () => {
				// Make onClick async to await signOut
				await supabase.auth.signOut();
				// Redirect after sign out is complete
				window.location.href = "/login";
			}}
		>
			Sign out
		</button>
	);
}
