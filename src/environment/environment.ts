import { Message } from "src/schema";
import { Role } from "../role";
import { MESSAGE_ROUTE_TO_ALL } from "src/utils/msg-const";

/**
 * Environment, hosting a batch of roles, and roles can publish message
 * to the environment.
 */
export class Environment {
  desc: string; // the description of this environment
  roles: Map<string, Role>;
  constructor({ desc }: { desc?: string }) {
    this.desc = desc ? desc : "";
    this.roles = new Map();
  }

  /**
   * Process all Role runs at once
   * @param k turns
   */
  async run(k = 1) {
    if (this.roles) {
      try {
        for (let i = 0; i < k; i++) {
          const futures = [];
          for (let role of this.roles.values()) {
            const future = role.run();
            futures.push(future);
          }
          await Promise.all(futures);
        }
      } catch (err) {
        console.log(err);
      }
    }
  }

  addRoles(roles: Role[]) {
    roles.forEach((role) => {
      this.roles.set(role.profile, role);

      // set role context, not RoleContext(it is runtime)
      // 這個context，還會存一些TokenCostManger、LLMConfig之類的？？
      // 因為這一些Roles都在同一個Environment裡面，所以要共享上下文，如llm等；

      // 在role中設置對 environment的引用
      role.setEnv(this);
    });
  }

  /**
   *
   * @param msg
   */
  publishMessage(msg: Message) {
    let found = false;
    const members = this.roles.keys();
    for (let roleName of members) {
      const role = this.roles.get(roleName) as Role;
      if (msg.sendTo == MESSAGE_ROUTE_TO_ALL) {
        role.putMessage(msg);
        found = true;
        continue;
      }
      if (msg.sendTo && msg.sendTo == roleName) {
        role.putMessage(msg);
        found = true;
        continue;
      }
    }

    if (!found) {
      throw new Error(`Message no recipients: ${JSON.stringify(msg)}`);
    }
  }
}
