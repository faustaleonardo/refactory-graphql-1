const express = require('express');
const app = express();
const expressGraphql = require('express-graphql');
const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLInt,
  GraphQLString,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull
} = require('graphql');

let { cities, months, genders, users } = require('./dummy-data');

const GenderType = new GraphQLObjectType({
  name: 'Gender',
  fields: () => ({
    genderId: { type: GraphQLID },
    value: { type: GraphQLString }
  })
});

const MonthType = new GraphQLObjectType({
  name: 'Month',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString }
  })
});

const CityType = new GraphQLObjectType({
  name: 'City',
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString }
  })
});

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: () => ({
    userId: { type: GraphQLID },
    name: { type: GraphQLString },
    hobby: { type: GraphQLString }
  })
});

const UserDetailsType = new GraphQLObjectType({
  name: 'UserDetails',
  fields: () => ({
    userId: { type: GraphQLID },
    name: { type: GraphQLString },
    hobby: { type: GraphQLString },
    monthOfBirth: {
      type: GraphQLString,
      resolve(parent) {
        const userId = parent.userId + '';

        const monthId = userId.slice(-2) * 1;
        return months.find(month => month.id === monthId).name;
      }
    },
    gender: {
      type: GraphQLString,
      resolve(parent) {
        const userId = parent.userId + '';

        const genderId = userId.slice(4, 6) * 1;
        return genders.find(gender => gender.genderId === genderId).value;
      }
    },
    city: {
      type: GraphQLString,
      resolve(parent) {
        const userId = parent.userId + '';

        const cityId = userId.slice(0, 4) * 1;
        return cities.find(city => city.id === cityId).name;
      }
    }
  })
});

const rootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    gender: {
      type: GenderType,
      args: { genderId: { type: GraphQLInt } },
      resolve(parent, args) {
        return genders.find(gender => gender.genderId === args.genderId);
      }
    },
    month: {
      type: MonthType,
      args: { id: { type: GraphQLInt } },
      resolve(parent, args) {
        return months.find(month => month.id === args.id);
      }
    },
    city: {
      type: CityType,
      args: { id: { type: GraphQLInt } },
      resolve(parent, args) {
        return cities.find(city => city.id === args.id);
      }
    },
    user: {
      type: UserType,
      args: { userId: { type: GraphQLInt } },
      resolve(parent, args) {
        return users.find(user => user.userId === args.userId);
      }
    },
    genders: {
      type: new GraphQLList(GenderType),
      resolve() {
        return genders;
      }
    },
    months: {
      type: new GraphQLList(MonthType),
      resolve() {
        return months;
      }
    },
    cities: {
      type: new GraphQLList(CityType),
      resolve() {
        return cities;
      }
    },
    users: {
      type: new GraphQLList(UserType),
      resolve() {
        return users;
      }
    },
    getDetails: {
      type: UserDetailsType,
      args: { userId: { type: GraphQLInt } },
      resolve(parent, args) {
        const user = users.find(user => user.userId === args.userId);
        return user;
      }
    }
  }
});

const rootMutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addUser: {
      type: UserType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        hobby: { type: new GraphQLNonNull(GraphQLString) }
      },
      resolve(parent, { userId, name, hobby }) {
        const newUser = {
          userId,
          name,
          hobby
        };
        users.push(newUser);

        return newUser;
      }
    },
    editUser: {
      type: UserType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLString },
        hobby: { type: GraphQLString }
      },
      resolve(parent, { userId, name, hobby }) {
        const user = users.find(user => user.userId === userId);
        if (name) user.name = name;
        if (hobby) user.hobby = hobby;
        return user;
      }
    },
    deleteUser: {
      type: UserType,
      args: {
        userId: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve(parent, { userId }) {
        users = users.filter(user => user.userId !== userId);
      }
    }
  }
});

const schema = new GraphQLSchema({
  query: rootQuery,
  mutation: rootMutation
});

app.use(
  '/graphql',
  expressGraphql({
    schema: schema,
    graphiql: true
  })
);

const port = 3000;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
