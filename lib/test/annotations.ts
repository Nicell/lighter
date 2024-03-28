import { expect, test } from "vitest";

export function runAnnotationTests({ extractAnnotations, highlight }) {
  async function extract(code: string, lang: string) {
    const extracted = await extractAnnotations(code, lang, extractor);
    const highlighted = await highlight(extracted.code, lang, "dark-plus", {
      annotations: extracted.annotations,
    });
    return { extracted, highlighted };
  }

  test("extract annottations", async () => {
    const code = `
const x = 1;
// foo
const y = 2;`.trim();

    const result = await extractAnnotations(code, "js", ["foo"]);
    expect(result).toMatchSnapshot();
    const hResult = await highlight(result.code, "js", "dark-plus", {
      annotations: result.annotations,
    });
    expect(hResult).toMatchSnapshot();
  });

  test("extract annottations from text", async () => {
    const code = `
const x = 1;
// foo[3:5]
const y = 2;`.trim();

    const result = await extractAnnotations(code, "text", ["foo"]);
    expect(result).toMatchSnapshot();
    const hResult = await highlight(result.code, "text", "dark-plus", {
      annotations: result.annotations,
    });
    expect(hResult).toMatchSnapshot();
  });

  test("extract annottations from txt", async () => {
    const code = `
const x = 1;
# foo[3:5]
const y = 2;`.trim();

    const result = await extractAnnotations(code, "txt", ["foo"]);
    expect(result).toMatchSnapshot();
    const hResult = await highlight(result.code, "txt", "dark-plus", {
      annotations: result.annotations,
    });
    expect(hResult).toMatchSnapshot();
  });

  test("extract annottations from mdx", async () => {
    const code = `
{/* foo[3:5] */}
# Hi there
{/* bar */}`.trim();

    const result = await extractAnnotations(code, "mdx", ["foo"]);
    expect(result).toMatchSnapshot();
    const hResult = await highlight(result.code, "mdx", "dark-plus", {
      annotations: result.annotations,
    });
    expect(hResult).toMatchSnapshot();
  });

  test("extract annottations from jsx", async () => {
    const code = `
const x = <div>
  {/* foo[3:5] */}
  hey
</div>`.trim();

    const result = await extractAnnotations(code, "jsx", ["foo"]);
    expect(result).toMatchSnapshot();
    const hResult = await highlight(result.code, "mdx", "dark-plus", {
      annotations: result.annotations,
    });
    expect(hResult).toMatchSnapshot();
  });

  test("extract annottations with prefix", async () => {
    const code = `
// xyz[3:5] foo
const x = 1;
// !xy[3:5] bar
const y = 2;`.trim();

    const { extracted, highlighted } = await extract(code, "jsx");
    expect(extracted).toMatchSnapshot();
    expect(highlighted).toMatchSnapshot();
  });
}

const extractor = (comment: string) => {
  const regex = /\s*(!?[\w-]+)?(\([^\)]*\)|\[[^\]]*\])?(.*)$/;
  const match = comment.match(regex);
  const name = match[1];
  const rangeString = match[2];
  const query = match[3]?.trim();
  if (!name || !name.startsWith("!")) {
    return null;
  }
  return {
    name: name.slice(1),
    rangeString,
    query,
  };
};
