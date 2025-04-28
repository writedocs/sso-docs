import supabase from "./client";
import { projectID } from "../plan.js";

export async function getLoginPainelStatus() {
	if (!projectID) {
		return false;
	}

	const { data, error } = await supabase
		.from("docusaurus_login_painel")
		.select("*")
		.eq("project_id", projectID);

	if (error || !data) {
		return false;
	}

	if (data.length === 0) {
		return false;
	}

	const { docusaurus_sso } = data[0];

	if (docusaurus_sso) {
		return true;
	}

	return false;
}
