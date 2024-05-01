const mongoose = require("mongoose");
const autopopulate = require("mongoose-autopopulate");

const { Schema } = mongoose;

const SearchSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      requried: [true, "User is required."],
    },
    search: {
      type: Schema.Types.ObjectId,
      ref: "User",
      requried: [true, "Search is required."],
      autopopulate: {
        select: "_id username fullname avatar",
        maxDepth: 1,
      },
    },
    searchAt: {
      type: Date,
      requried: [true, "Search time is required."],
    },
  }
  // { timestamps: true }
);

SearchSchema.plugin(autopopulate);

const SearchHistory = mongoose.model("Search-History", SearchSchema);

// SearchHistory.watch().on("change", (data) => {
//   console.log(data);
// });

// {
//   _id: {
//     _data: '826630C'
//   },
//   operationType: 'insert',
//   clusterTime: new Timestamp({ t: 1714472096, i: 8 }),
//   wallTime: 2024-04-30T10:14:56.491Z,
//   fullDocument: {
//     _id: new ObjectId('6630c4a0343cb6b706a295c8'),
//     user: new ObjectId('658b9129e2ef23426b634dfa'),
//     search: new ObjectId('658c16a166180974270152df'),
//     __v: 0,
//     searchAt: 2024-04-30T10:14:56.266Z
//   },
//   ns: { db: 'Instagram', coll: 'search-histories' },
//   documentKey: { _id: new ObjectId('6630c4a0343cb6b706a295c8') }
// }

module.exports = SearchHistory;
