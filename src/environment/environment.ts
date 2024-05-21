import { Role } from "metagpt/role/role";

/**
 * Environment, hosting a batch of roles, and roles can publish message
 * to the environment.
 */
export class Environment {
  members: { [key: string]: Role } | null;

  constructor() {
    this.members = null;
  }

  /**
   * Process all Role runs at once
   * @param k
   */
  async run(k = 1) {
    if (this.members) {
      for (let i = 0; i < k; i++) {
        const futures = [];

        for (let role of Object.values(this.members)) {
          const future = role.run();
          futures.push(future);
        }
        await Promise.all(futures);
      }
    }
  }

  addRoles(roles: Role[]) {
    roles.forEach((role) => {
      this.members = {
        ...this.members,
        [role.profile]: role,
      };

      // set role context, not RoleContext(it is runtime)
      // 這個context，還會存一些TokenCostManger、LLMConfig之類的？？

      // 在role中設置對 environment的引用
      role.setEnv(this);
    });
  }
}
