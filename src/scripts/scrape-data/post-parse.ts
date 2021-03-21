// Copyright (c) 2021 MillenniumEarl
//
// This software is released under the MIT License.
// https://opensource.org/licenses/MIT

"use strict";

// Import from files
import { POST } from "../constants/css-selector";

//#region Interfaces

/**
 * Represents an element contained in the post.
 */
export interface IPostElement {
  /**
   * Type of element.
   */
  type: "Generic" | "Text" | "Link" | "Image" | "Spoiler";
  /**
   * Name associated with the element.
   */
  name: string;
  /**
   * Text of the content of the element excluding any children.
   */
  text: string;
  /**
   * Children elements contained in this element.
   */
  content: IPostElement[];
}

/**
 * Represents a link type link in the post.
 */
export interface ILink extends IPostElement {
  type: "Image" | "Link";
  /**
   * Link to the resource.
   */
  href: string;
}

//#endregion Interfaces

//#region Public methods

/**
 * Given a post of a thread page it extracts the information contained in the body.
 */
export function parseF95ThreadPost($: cheerio.Root, post: cheerio.Cheerio): IPostElement[] {
  // The data is divided between "tag" and "text" elements.
  // Simple data is composed of a "tag" element followed
  // by a "text" element, while more complex data (contained
  // in spoilers) is composed of a "tag" element, followed
  // by a text containing only ":" and then by an additional
  // "tag" element having as the first term "Spoiler"

  // First fetch all the elements in the post
  const elements = post
    .contents()
    .toArray()
    .map((e) => parseCheerioNode($, e)); // Parse the nodes

  // Create a supernode
  let supernode = createGenericElement();
  supernode.content = elements;

  // Reduce the nodes
  supernode = reducePostElement(supernode);

  // Remove the empty nodes
  supernode = removeEmptyContentFromElement(supernode);

  // Finally parse the elements to create the pairs of title/data
  return associateNameToElements(supernode.content);
}

//#endregion Public methods

//#region Private methods

//#region Node type

/**
 * Check if the node passed as a parameter is a formatting one (i.e. `<b>`).
 */
function isFormattingNode(node: cheerio.Element): boolean {
  const formattedTags = ["b", "i"];
  return node.type === "tag" && formattedTags.includes(node.name);
}

/**
 * Check if the node passed as a parameter is of text type.
 */
function isTextNode(node: cheerio.Element): boolean {
  return node.type === "text";
}

/**
 * Check if the node is a spoiler.
 */
function isSpoilerNode(node: cheerio.Cheerio): boolean {
  return node.attr("class") === "bbCodeSpoiler";
}

/**
 * Check if the node is a link or a image.
 */
function isLinkNode(node: cheerio.Element): boolean {
  // Local variables
  let valid = false;

  // The node is a valid DOM element
  if (node.type === "tag") {
    const el = node as cheerio.TagElement;
    valid = el.name === "a" || el.name === "img";
  }

  return valid;
}

/**
 * Check if the node is a `noscript` tag.
 */
function isNoScriptNode(node: cheerio.Element): boolean {
  return node.type === "tag" && node.name === "noscript";
}

//#endregion Node Type

//#region Parse Cheerio node

/**
 * Process a spoiler element by getting its text broken
 * down by any other spoiler elements present.
 */
function parseCheerioSpoilerNode($: cheerio.Root, node: cheerio.Cheerio): IPostElement {
  // A spoiler block is composed of a div with class "bbCodeSpoiler",
  // containing a div "bbCodeSpoiler-content" containing, in cascade,
  // a div with class "bbCodeBlock--spoiler" and a div with class "bbCodeBlock-content".
  // This last tag contains the required data.

  // Local variables
  const spoiler: IPostElement = {
    type: "Spoiler",
    name: "",
    text: "",
    content: []
  };

  // Find the title of the spoiler (contained in the button)
  const name = node.find(POST.SPOILER_NAME)?.first();
  spoiler.name = name ? name.text().trim() : "";

  // Parse the content of the spoiler
  spoiler.content = node
    .find(POST.SPOILER_CONTENT)
    .contents()
    .toArray()
    .map((el) => parseCheerioNode($, el));

  // Clean text (Spoiler has no text) @todo
  // spoiler.text = spoiler.text.replace(/\s\s+/g, " ").trim();
  return spoiler;
}

/**
 * Process a node that contains a link or image.
 */
function parseCheerioLinkNode(element: cheerio.Cheerio): ILink {
  // Local variable
  const link: ILink = {
    type: "Link",
    name: "",
    text: "",
    href: "",
    content: []
  };

  if (element.is("img")) {
    link.type = "Image";
    link.text = element.attr("alt") ?? "";
    link.href = element.attr("data-src");
  } else if (element.is("a")) {
    link.type = "Link";
    link.text = element.text().replace(/\s\s+/g, " ").trim();
    link.href = element.attr("href");
  }

  return link;
}

/**
 * Process a text only node.
 */
function parseCheerioTextNode(node: cheerio.Cheerio): IPostElement {
  const content: IPostElement = {
    type: "Text",
    name: "",
    text: getCheerioNonChildrenText(node),
    content: []
  };
  return content;
}

//#endregion Parse Cheerio node

//#region IPostElement utility

/**
 * Check if the node has non empty `name` and `text`.
 */
function isPostElementUnknown(node: IPostElement): boolean {
  // @todo For some strange reason, if the node IS empty but
  // node.type === "Text" the 2nd statement return false.
  return node.name.trim() === "" && node.text.trim() === "";
}

/**
 * Check if the node has a non empty property
 * between `name`, `text` and `content`.
 */
function isPostElementEmpty(node: IPostElement): boolean {
  return node.content.length === 0 && isPostElementUnknown(node);
}

/**
 * Create a `IPostElement` without name, text or content.
 */
function createGenericElement(): IPostElement {
  return {
    type: "Generic",
    name: "",
    text: "",
    content: []
  };
}

/**
 * Check if the element contains the overview of a thread (post #1).
 */
function elementIsOverview(element: IPostElement): boolean {
  // Search the text element that start with "overview"
  const result = element.content
    .filter((e) => e.type === "Text")
    .find((e) => e.text.toUpperCase().startsWith("OVERVIEW"));
  return result !== undefined;
}

/**
 * If the element contains the overview of a thread, parse it.
 */
function getOverviewFromElement(element: IPostElement): string {
  // Local variables
  const alphanumericRegex = new RegExp("[a-zA-Z0-9]+");

  // Get all the text values of the overview
  const textes = element.content
    .filter((e) => e.type === "Text")
    .filter((e) => {
      const cleanValue = e.text.toUpperCase().replace("OVERVIEW", "").trim();
      const isAlphanumeric = alphanumericRegex.test(cleanValue);

      return cleanValue !== "" && isAlphanumeric;
    })
    .map((e) => e.text);

  // Joins the textes
  return textes.join(" ");
}

//#endregion IPostElement utility

/**
 * Gets the text of the node only, excluding child nodes.
 * Also includes formatted text elements (i.e. `<b>`).
 */
function getCheerioNonChildrenText(node: cheerio.Cheerio): string {
  // Local variable
  let text = "";

  // If the node has no children, return the node's text
  if (node.contents().length === 1) {
    // @todo Remove IF after cheerio RC6
    text = node.text();
  } else {
    // Find all the text nodes in the node
    text = node
      .first()
      .contents() // @todo Change to children() after cheerio RC6
      .filter((idx, el) => isTextNode(el))
      .text();
  }

  // Clean and return the text
  return text.replace(/\s\s+/g, " ").trim();
}

/**
 * Collapse an `IPostElement` element with a single subnode
 * in the `Content` field in case it has no information.
 */
function reducePostElement(element: IPostElement): IPostElement {
  // Local variables
  const shallowCopy = Object.assign({}, element);

  // If the node has only one child, reduce and return it
  if (isPostElementUnknown(shallowCopy) && shallowCopy.content.length === 1) {
    return reducePostElement(shallowCopy.content[0]);
  }

  // Reduce element's childs
  shallowCopy.content = shallowCopy.content.map((e) => reducePostElement(e));

  return shallowCopy;
}

/**
 * Remove all empty children elements of the elements for parameter.
 */
function removeEmptyContentFromElement(element: IPostElement, recursive = true): IPostElement {
  // Create a copy of the element
  const copy = Object.assign({}, element);

  // Reduce nested contents if recursive
  const recursiveResult = recursive
    ? element.content.map((e) => removeEmptyContentFromElement(e))
    : copy.content;

  // Find the non-empty nodes
  const validNodes = recursiveResult.filter((e) => !isPostElementEmpty(e));

  // Assign the nodes
  copy.content = validNodes;

  return copy;
}

/**
 * Transform a `cheerio.Cheerio` node into an `IPostElement` element with its subnodes.
 */
function parseCheerioNode($: cheerio.Root, node: cheerio.Element): IPostElement {
  // Local variables
  let post: IPostElement = createGenericElement();
  const cheerioNode = $(node);

  // Parse the node
  if (!isNoScriptNode(node)) {
    if (isTextNode(node) && !isFormattingNode(node)) post = parseCheerioTextNode(cheerioNode);
    else if (isSpoilerNode(cheerioNode)) post = parseCheerioSpoilerNode($, cheerioNode);
    else if (isLinkNode(node)) post = parseCheerioLinkNode(cheerioNode);

    // Check for childrens only if the node is a <b>/<i> element.
    // For the link in unnecessary while for the spoilers is
    // already done in parseCheerioSpoilerNode
    if (isFormattingNode(node)) {
      // Parse the node's childrens
      const childPosts = cheerioNode
        .contents() // @todo Change to children() after cheerio RC6
        .toArray()
        .filter((el) => el) // Ignore undefined elements
        .map((el) => parseCheerioNode($, el))
        .filter((el) => !isPostElementEmpty(el));
      post.content.push(...childPosts);
    }
  }

  return post;
}

/**
 * It simplifies the `IPostElement` elements by associating
 * the corresponding value to each characterizing element (i.e. author).
 */
function associateNameToElements(elements: IPostElement[]): IPostElement[] {
  // Local variables
  const pairs: IPostElement[] = [];
  const specialCharsRegex = /^[-!$%^&*()_+|~=`{}[\]:";'<>?,./]/;
  const specialRegex = new RegExp(specialCharsRegex);
  const x = pairUp(elements);

  for (let i = 0; i < elements.length; i++) {
    // If the text starts with a special char, clean it
    const startWithSpecial = specialRegex.test(elements[i].text);

    // Get the latest IPostElement in "pairs"
    const lastIndex = pairs.length - 1;
    const lastPair = pairs[lastIndex];

    // If this statement is valid, we have a "data"
    if (elements[i].type === "Text" && startWithSpecial && pairs.length > 0) {
      // We merge this element with the last element appended to 'pairs'
      const cleanText = elements[i].text.replace(specialCharsRegex, "").trim();
      lastPair.text = lastPair.text || cleanText;
      lastPair.content.push(...elements[i].content);
    }
    // This is a special case
    else if (elementIsOverview(elements[i])) {
      // We add the overview to the pairs as a text element
      elements[i].type = "Text";
      elements[i].name = "Overview";
      elements[i].text = getOverviewFromElement(elements[i]);
      pairs.push(elements[i]);
    }
    // We have an element referred to the previous "title"
    else if (elements[i].type != "Text" && pairs.length > 0) {
      // We append this element to the content of the last title
      lastPair.content.push(elements[i]);
    }
    // ... else we have a "title" (we need to swap the text to the name because it is a title)
    else {
      const swap: IPostElement = Object.assign({}, elements[i]);
      swap.name = elements[i].text;
      swap.text = "";
      pairs.push(swap);
    }
  }

  return pairs;
}

function pairUp(elements: IPostElement[]): IPostElement[] {
  // First ignore the "Generic" type elements, because
  // they usually are containers for other data, like
  // overview or download links.
  const validElements = elements.filter((e) => e.type !== "Generic");

  // Than we find all the IDs of "Text" elements where the
  // text doesn't starts with double points. This means
  // that we find all the IDs of "title" elements.
  const indexes = validElements
    .filter(
      (e, i) =>
        e.type === "Text" && // This element must be a text
        ((e.text.endsWith(":") && e.text !== ":") || // This element's text must ends with ":"
          validElements[i + 1]?.text.startsWith(":")) // The next element's text must start with ":"
    )
    .map((e) => validElements.indexOf(e));

  // Now we find all the elements between indexes and
  // associate them with the previous "title" element
  const data = indexes.map((i, j) => parseGroupData(i, j, indexes, validElements));

  // Now parse all the "invalid" elements,
  // so all the elements with "Generic" type
  const genericElementsPairs = elements
    .filter((e) => e.type === "Generic")
    .map((e) => pairUp(e.content));

  const flatten: IPostElement[] = [].concat(...genericElementsPairs);
  data.push(...flatten);

  return data;
}

function parseGroupData(
  start: number,
  index: number,
  indexes: number[],
  elements: IPostElement[]
): IPostElement {
  // Local variables
  const endsWithSpecialCharsRegex = /[-!$%^&*()_+|~=`{}[\]:";'<>?,./]$/;
  const startsWithDoublePointsRegex = /^[:]/;

  // Find all the elements (title + data) of the same data group
  const nextIndex = indexes[index + 1] ?? elements.length;
  const group = elements.slice(start, nextIndex);

  // Extract the title
  const title = group.shift();

  // Assign name and text of the title
  title.name = title.text.replace(endsWithSpecialCharsRegex, "").trim();
  title.text = group
    .filter((e) => e.type === "Text")
    .map((e) =>
      e.text
        .replace(startsWithDoublePointsRegex, "") // Remove the starting ":" from the element's text
        .replace(endsWithSpecialCharsRegex, "") // Remove any special chars at the end
        .trim()
    )
    .join(" ") // Join with space
    .trim();

  // Append all the content of non-text elements.
  group
    .filter((e) => e.type !== "Text")
    .forEach(
      (e) =>
        e.type === "Spoiler"
          ? title.content.push(...e.content) // Add all the content fo the spoiler
          : title.content.push(e) // Add the element itself
    );

  return title;
}

//#endregion Private methods
