
export type CheckResult = {
  platform: string;
  username: string;
  available: boolean;
  status: "AVAILABLE" | "TAKEN" | "ERROR";
  message?: string;
};

export async function checkUsername(username: string, platform: string): Promise<CheckResult> {
  switch (platform.toUpperCase()) {
    case "GITHUB":
      return checkGithub(username);
    case "MINECRAFT":
      return checkMinecraft(username);
    case "ROBLOX":
      return checkRoblox(username);
    case "DISCORD":
      return checkDiscordMock(username); // Discord requires a bot token/complex setup
    default:
      return {
        platform,
        username,
        available: false,
        status: "ERROR",
        message: "Platform not supported",
      };
  }
}

async function checkGithub(username: string): Promise<CheckResult> {
  try {
    const res = await fetch(`https://api.github.com/users/${username}`);
    if (res.status === 404) {
      return { platform: "GITHUB", username, available: true, status: "AVAILABLE" };
    } else if (res.status === 200) {
      return { platform: "GITHUB", username, available: false, status: "TAKEN" };
    }
    return { platform: "GITHUB", username, available: false, status: "ERROR", message: `API Status: ${res.status}` };
  } catch (error) {
    return { platform: "GITHUB", username, available: false, status: "ERROR", message: "Network error" };
  }
}

async function checkMinecraft(username: string): Promise<CheckResult> {
  // Mojang API: https://api.mojang.com/users/profiles/minecraft/<username>
  // If 200 -> Taken
  // If 204 or 404 -> Available (mostly)
  try {
    const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);
    if (res.status === 200) {
      return { platform: "MINECRAFT", username, available: false, status: "TAKEN" };
    } else if (res.status === 204 || res.status === 404) {
      return { platform: "MINECRAFT", username, available: true, status: "AVAILABLE" };
    }
    return { platform: "MINECRAFT", username, available: false, status: "ERROR", message: `API Status: ${res.status}` };
  } catch (error) {
    return { platform: "MINECRAFT", username, available: false, status: "ERROR", message: "Network error" };
  }
}

async function checkRoblox(username: string): Promise<CheckResult> {
  // Roblox API is more complex, often requires proxy or specific endpoints.
  // Using a known endpoint for user search.
  // https://users.roblox.com/v1/users/search?keyword=<username>&limit=10
  try {
    const res = await fetch(`https://users.roblox.com/v1/users/search?keyword=${username}&limit=10`);
    const data = await res.json();
    
    if (data.data && Array.isArray(data.data)) {
      const exactMatch = data.data.find((user: any) => user.name.toLowerCase() === username.toLowerCase());
      if (exactMatch) {
        return { platform: "ROBLOX", username, available: false, status: "TAKEN" };
      }
      return { platform: "ROBLOX", username, available: true, status: "AVAILABLE" };
    }
    return { platform: "ROBLOX", username, available: false, status: "ERROR", message: "Invalid response" };
  } catch (error) {
    return { platform: "ROBLOX", username, available: false, status: "ERROR", message: "Network error" };
  }
}

async function checkDiscordMock(username: string): Promise<CheckResult> {
  // Discord username system changed to unique usernames (no discriminators).
  // No public API to check availability without Auth.
  // Simulating a check for now.
  
  // Logic: Randomly assign available if length > 4 to simulate "checking"
  const isRare = username.length <= 3;
  const isAvailable = Math.random() > 0.8; // 20% chance of being available for simulation

  return {
    platform: "DISCORD",
    username,
    available: isAvailable,
    status: isAvailable ? "AVAILABLE" : "TAKEN",
    message: "Discord check is simulated (Requires Bot Token)",
  };
}
