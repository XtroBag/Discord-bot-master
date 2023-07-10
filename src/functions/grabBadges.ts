import { User } from "discord.js";
import { BadgeStrings } from "../../config.js";

/**
 * @function {UsernameBadge} This function returns if the user has the username badge
 */
export function UsernameBadge(user: User, array: Array<string>) {
  if (
    !user.discriminator ||
    user.discriminator === "0" ||
    user.tag === `${user.username}#0`
  ) {
    return array.push(BadgeStrings.Username);
  }
}
