/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/** @type TagsData */
const tagsData = require('../_data/tagsData.json');
const {livePosts} = require('../_filters/live-posts');
const {sortByUpdated} = require('../_utils/sort-by-updated');

/** @type Tags */
let processedCollection;

/**
 * Returns all tags with their posts.
 *
 * @param {EleventyCollectionObject} [collections] Eleventy collection object
 * @return {Tags}
 */
module.exports = (collections) => {
  if (processedCollection) {
    return processedCollection;
  }

  /** @type Tags */
  const tags = {};

  Object.keys(tagsData).forEach((key) => {
    const tagData = tagsData[key];
    const href = `/tags/${key}/`;
    let elements = [];
    let date, updated;

    // Get posts
    if (collections) {
      elements = collections
        .getFilteredByGlob('**/*.md')
        .filter(
          (item) =>
            livePosts(item) &&
            !item.data.excludeFromTags &&
            (item.data.tags || []).includes(key),
        )
        .sort(sortByUpdated);
    }

    // Limit posts for percy
    if (process.env.PERCY) {
      elements = elements.slice(-6);
    }

    // Set created on date and updated date
    if (elements.length > 0) {
      date = elements.slice(-1).pop().data.date;
      const tempUpdated = elements.slice(0, 1).pop().data.date;
      if (date !== tempUpdated) {
        updated = tempUpdated;
      }
    }

    /** @type TagsItem */
    const tag = {
      ...tagData,
      data: {
        date,
        tags: [key],
        updated,
      },
      elements,
      href,
      key,
      url: href,
    };

    if (tag.elements.length > 0 || !collections) {
      tags[tag.key] = tag;
    }
  });

  if (collections) {
    processedCollection = tags;
  }

  return tags;
};
