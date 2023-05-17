const bcrypt = require('bcrypt')

module.exports = {
  async up(queryInterface, Sequelize) {
    const salt = await bcrypt.genSalt(10);
    const hash1 = await bcrypt.hash('password', salt);
    const hash2 = await bcrypt.hash('password', salt);

    await queryInterface.bulkInsert(
      "users",
      [
        {
          username: "user1",
          password: hash1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: "user2",
          password: hash2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};