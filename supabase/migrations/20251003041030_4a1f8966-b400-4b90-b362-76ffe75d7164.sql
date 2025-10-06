-- Add unique constraint to slug if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'courses_slug_key'
  ) THEN
    ALTER TABLE public.courses ADD CONSTRAINT courses_slug_key UNIQUE (slug);
  END IF;
END $$;

-- Insert HTML & CSS Foundations course
INSERT INTO public.courses (title, description, instructor_name, duration_hours, price, category, is_premium, is_published, slug)
VALUES (
  'HTML & CSS Foundations',
  'Master the fundamentals of web development with HTML and CSS. Build responsive websites from scratch with hands-on lessons and practical quizzes.',
  'AimWell Academy',
  20,
  0,
  'beginner',
  false,
  true,
  'html-css-foundations'
) ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  instructor_name = EXCLUDED.instructor_name,
  duration_hours = EXCLUDED.duration_hours,
  price = EXCLUDED.price,
  category = EXCLUDED.category,
  is_premium = EXCLUDED.is_premium,
  is_published = EXCLUDED.is_published
RETURNING id;

-- Get the course_id for seeding lessons
DO $$
DECLARE
  v_course_id uuid;
  v_lesson1_id uuid;
  v_lesson2_id uuid;
  v_lesson3_id uuid;
  v_lesson4_id uuid;
  v_lesson5_id uuid;
  v_lesson6_id uuid;
  v_lesson7_id uuid;
  v_lesson8_id uuid;
  v_lesson9_id uuid;
  v_lesson10_id uuid;
  v_quiz_id uuid;
BEGIN
  -- Get course ID
  SELECT id INTO v_course_id FROM public.courses WHERE slug = 'html-css-foundations';

  -- Delete existing lessons for this course to avoid duplicates
  DELETE FROM public.lessons WHERE course_id = v_course_id;

  -- Lesson 1: Introduction to HTML
  INSERT INTO public.lessons (course_id, title, description, content, video_url, order_index, duration_minutes)
  VALUES (
    v_course_id,
    'Introduction to HTML',
    'Learn the fundamentals of HTML and web document structure',
    E'# Introduction to HTML\n\n## What is HTML?\n\nHTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure and content of a web page using a system of tags and elements.\n\n## Role in Web Development\n\nHTML forms the backbone of every website. It works alongside CSS (for styling) and JavaScript (for interactivity) to create complete web experiences.\n\n## Structure of an HTML Document\n\nEvery HTML document follows this basic structure:\n\n```html\n<!DOCTYPE html>\n<html>\n  <head>\n    <title>Page Title</title>\n  </head>\n  <body>\n    <h1>This is a Heading</h1>\n    <p>This is a paragraph.</p>\n  </body>\n</html>\n```\n\n## Importance of DOCTYPE\n\nThe `<!DOCTYPE html>` declaration tells the browser which version of HTML the page is using. It must be the first line in your HTML document.',
    'https://www.youtube.com/watch?v=UB1O30fR-EE',
    1,
    45
  ) RETURNING id INTO v_lesson1_id;

  -- Create quiz for Lesson 1
  INSERT INTO public.quizzes (lesson_id, title, pass_percentage)
  VALUES (v_lesson1_id, 'HTML Basics Quiz', 60)
  RETURNING id INTO v_quiz_id;

  -- Insert quiz questions for Lesson 1
  INSERT INTO public.quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES
  (v_quiz_id, 'What does HTML stand for?', 'Hyper Text Markup Language', 'High Tech Modern Language', 'Home Tool Markup Language', 'Hyperlinks and Text Markup Language', 'A', 1),
  (v_quiz_id, 'Which HTML element is used to define the title of a document?', '<head>', '<title>', '<meta>', '<header>', 'B', 2),
  (v_quiz_id, 'What is the correct HTML element for inserting a line break?', '<lb>', '<break>', '<br>', '<newline>', 'C', 3),
  (v_quiz_id, 'Which doctype is correct for HTML5?', '<!DOCTYPE html5>', '<!DOCTYPE HTML>', '<!DOCTYPE html>', '<!DOCTYPE>', 'C', 4),
  (v_quiz_id, 'What is the purpose of the <head> element?', 'Contains visible content', 'Contains metadata', 'Contains JavaScript', 'Contains images', 'B', 5),
  (v_quiz_id, 'Which element contains the visible content of a webpage?', '<body>', '<head>', '<html>', '<content>', 'A', 6),
  (v_quiz_id, 'HTML tags are normally ___?', 'in pairs', 'singular', 'optional', 'case-sensitive', 'A', 7),
  (v_quiz_id, 'Which tag is used for the largest heading?', '<h1>', '<h6>', '<heading>', '<head>', 'A', 8),
  (v_quiz_id, 'HTML is a ___?', 'Programming language', 'Markup language', 'Scripting language', 'Database language', 'B', 9),
  (v_quiz_id, 'Which HTML attribute specifies an alternate text for an image?', 'title', 'alt', 'src', 'text', 'B', 10),
  (v_quiz_id, 'What is the correct way to comment in HTML?', '// comment', '/* comment */', '<!-- comment -->', '# comment', 'C', 11),
  (v_quiz_id, 'Which HTML element defines navigation links?', '<navigation>', '<nav>', '<navigate>', '<links>', 'B', 12),
  (v_quiz_id, 'What does the lang attribute in <html> specify?', 'Programming language', 'Page language', 'Link language', 'Label language', 'B', 13),
  (v_quiz_id, 'HTML elements are defined by?', 'Attributes', 'Tags', 'Properties', 'Classes', 'B', 14),
  (v_quiz_id, 'Which is NOT a valid HTML5 element?', '<article>', '<section>', '<aside>', '<content>', 'D', 15);

  -- Lesson 2: HTML Text Formatting & Headings
  INSERT INTO public.lessons (course_id, title, description, content, video_url, order_index, duration_minutes)
  VALUES (
    v_course_id,
    'HTML Text Formatting & Headings',
    'Master text formatting, headings, and semantic HTML elements',
    E'# HTML Text Formatting & Headings\n\n## Headings\n\nHTML provides six levels of headings, from `<h1>` (most important) to `<h6>` (least important):\n\n```html\n<h1>Main Heading</h1>\n<h2>Sub Heading</h2>\n<h3>Section Heading</h3>\n```\n\n## Paragraphs\n\nThe `<p>` tag defines a paragraph:\n\n```html\n<p>This is a paragraph of text.</p>\n```\n\n## Text Formatting\n\n### Visual Formatting\n- `<b>` - Bold text\n- `<i>` - Italic text\n- `<u>` - Underlined text\n\n### Semantic Formatting (Preferred)\n- `<strong>` - Important text (bold)\n- `<em>` - Emphasized text (italic)\n- `<mark>` - Highlighted text\n- `<small>` - Smaller text\n- `<del>` - Deleted text\n- `<ins>` - Inserted text\n\n## Best Practices\n\nUse semantic tags (`<strong>`, `<em>`) instead of visual tags (`<b>`, `<i>`) for better accessibility and SEO.',
    'https://www.youtube.com/watch?v=kDyJN7qQETA',
    2,
    40
  ) RETURNING id INTO v_lesson2_id;

  INSERT INTO public.quizzes (lesson_id, title, pass_percentage)
  VALUES (v_lesson2_id, 'Text Formatting Quiz', 60)
  RETURNING id INTO v_quiz_id;

  INSERT INTO public.quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES
  (v_quiz_id, 'How many heading levels does HTML support?', '4', '5', '6', '7', 'C', 1),
  (v_quiz_id, 'Which heading is the largest?', '<h6>', '<h3>', '<h1>', '<heading>', 'C', 2),
  (v_quiz_id, 'What does the <strong> tag represent?', 'Bold text', 'Important text', 'Large text', 'Header text', 'B', 3),
  (v_quiz_id, 'Which tag is semantic for emphasized text?', '<i>', '<em>', '<italic>', '<emphasis>', 'B', 4),
  (v_quiz_id, 'The <p> tag defines a ___?', 'page', 'paragraph', 'program', 'picture', 'B', 5),
  (v_quiz_id, 'Which is better for SEO: <b> or <strong>?', '<b>', '<strong>', 'Both equal', 'Neither', 'B', 6),
  (v_quiz_id, 'The <mark> tag is used to ___?', 'mark important', 'highlight text', 'create bookmarks', 'mark headers', 'B', 7),
  (v_quiz_id, 'Which tag shows deleted text?', '<remove>', '<delete>', '<del>', '<strike>', 'C', 8),
  (v_quiz_id, 'The <small> tag makes text ___?', 'smaller', 'bold', 'italic', 'hidden', 'A', 9),
  (v_quiz_id, 'Which tag represents inserted text?', '<add>', '<insert>', '<ins>', '<new>', 'C', 10),
  (v_quiz_id, 'Can you nest headings inside paragraphs?', 'Yes, always', 'No, never', 'Only h6', 'Only with CSS', 'B', 11),
  (v_quiz_id, 'The <i> tag makes text ___?', 'important', 'italic', 'invisible', 'indented', 'B', 12),
  (v_quiz_id, 'Which is NOT a text formatting tag?', '<b>', '<strong>', '<div>', '<em>', 'C', 13),
  (v_quiz_id, 'Semantic HTML improves ___?', 'Speed only', 'SEO and accessibility', 'Colors', 'Images', 'B', 14),
  (v_quiz_id, 'The <u> tag is used for ___?', 'uppercase', 'underline', 'unique', 'update', 'B', 15);

  -- Lesson 3: Links & Images
  INSERT INTO public.lessons (course_id, title, description, content, video_url, order_index, duration_minutes)
  VALUES (
    v_course_id,
    'Links & Images',
    'Learn to add hyperlinks and images to your web pages',
    E'# Links & Images\n\n## Hyperlinks\n\nThe `<a>` tag creates hyperlinks:\n\n```html\n<a href="https://example.com">Visit Example</a>\n```\n\n### Common Attributes\n- `href` - Specifies the destination URL\n- `target="_blank"` - Opens link in new tab\n- `title` - Tooltip text on hover\n\n### Link Types\n```html\n<!-- External link -->\n<a href="https://google.com">Google</a>\n\n<!-- Internal link -->\n<a href="/about.html">About Us</a>\n\n<!-- Email link -->\n<a href="mailto:info@example.com">Email Us</a>\n\n<!-- Phone link -->\n<a href="tel:+1234567890">Call Us</a>\n```\n\n## Images\n\nThe `<img>` tag embeds images:\n\n```html\n<img src="image.jpg" alt="Description" width="300">\n```\n\n### Important Attributes\n- `src` - Image file path\n- `alt` - Alternative text (required for accessibility)\n- `width`, `height` - Image dimensions\n\n## Accessibility\n\nAlways include meaningful alt text for images to help screen readers and when images fail to load.',
    'https://www.youtube.com/watch?v=pQN-pnXPaVg',
    3,
    50
  ) RETURNING id INTO v_lesson3_id;

  INSERT INTO public.quizzes (lesson_id, title, pass_percentage)
  VALUES (v_lesson3_id, 'Links & Images Quiz', 60)
  RETURNING id INTO v_quiz_id;

  INSERT INTO public.quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES
  (v_quiz_id, 'Which tag creates a hyperlink?', '<link>', '<a>', '<href>', '<url>', 'B', 1),
  (v_quiz_id, 'What attribute specifies the link destination?', 'src', 'href', 'link', 'url', 'B', 2),
  (v_quiz_id, 'How do you open a link in a new tab?', 'target="_new"', 'target="_blank"', 'new="true"', 'blank="yes"', 'B', 3),
  (v_quiz_id, 'Which tag is used to insert an image?', '<image>', '<img>', '<pic>', '<photo>', 'B', 4),
  (v_quiz_id, 'The alt attribute is used for ___?', 'alignment', 'alternative text', 'altitude', 'alteration', 'B', 5),
  (v_quiz_id, 'Is the alt attribute required for images?', 'Yes, for accessibility', 'No, optional', 'Only for large images', 'Only for external images', 'A', 6),
  (v_quiz_id, 'What does src stand for in <img>?', 'source', 'secure', 'screen', 'style', 'A', 7),
  (v_quiz_id, 'Can images be clickable links?', 'No', 'Yes, wrap <img> in <a>', 'Only with JavaScript', 'Only external images', 'B', 8),
  (v_quiz_id, 'Which creates an email link?', 'href="email:..."', 'href="mailto:..."', 'href="mail:..."', 'href="@..."', 'B', 9),
  (v_quiz_id, 'The title attribute in links shows ___?', 'page title', 'tooltip on hover', 'browser title', 'header', 'B', 10),
  (v_quiz_id, 'Can you use relative paths in href?', 'No, only absolute', 'Yes', 'Only for images', 'Only with http', 'B', 11),
  (v_quiz_id, 'The width attribute accepts ___?', 'only percentages', 'only pixels', 'pixels or percentages', 'only keywords', 'C', 12),
  (v_quiz_id, 'What happens without alt text?', 'Image won''t load', 'Accessibility issues', 'Browser error', 'Nothing', 'B', 13),
  (v_quiz_id, 'Which link opens phone dialer?', 'href="phone:..."', 'href="tel:..."', 'href="call:..."', 'href="dial:..."', 'B', 14),
  (v_quiz_id, 'Image format NOT supported by browsers?', 'JPG', 'PNG', 'GIF', 'PSD', 'D', 15);

  -- Continue with remaining lessons...
  -- Lesson 4: Lists
  INSERT INTO public.lessons (course_id, title, description, content, video_url, order_index, duration_minutes)
  VALUES (
    v_course_id,
    'Lists (Ordered, Unordered, Description)',
    'Create and structure different types of lists in HTML',
    E'# HTML Lists\n\n## Unordered Lists\n\nUse `<ul>` for bullet point lists:\n\n```html\n<ul>\n  <li>First item</li>\n  <li>Second item</li>\n  <li>Third item</li>\n</ul>\n```\n\n## Ordered Lists\n\nUse `<ol>` for numbered lists:\n\n```html\n<ol>\n  <li>First step</li>\n  <li>Second step</li>\n  <li>Third step</li>\n</ol>\n```\n\n## Description Lists\n\nUse `<dl>`, `<dt>`, and `<dd>` for definition lists:\n\n```html\n<dl>\n  <dt>HTML</dt>\n  <dd>HyperText Markup Language</dd>\n  <dt>CSS</dt>\n  <dd>Cascading Style Sheets</dd>\n</dl>\n```\n\n## Nested Lists\n\nYou can nest lists inside each other:\n\n```html\n<ul>\n  <li>Item 1\n    <ul>\n      <li>Sub-item 1</li>\n      <li>Sub-item 2</li>\n    </ul>\n  </li>\n  <li>Item 2</li>\n</ul>\n```',
    'https://www.youtube.com/watch?v=yfoY53QXEnI',
    4,
    35
  ) RETURNING id INTO v_lesson4_id;

  INSERT INTO public.quizzes (lesson_id, title, pass_percentage)
  VALUES (v_lesson4_id, 'Lists Quiz', 60)
  RETURNING id INTO v_quiz_id;

  INSERT INTO public.quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES
  (v_quiz_id, 'Which tag creates an unordered list?', '<ul>', '<ol>', '<list>', '<ulist>', 'A', 1),
  (v_quiz_id, 'Which tag creates an ordered list?', '<ul>', '<ol>', '<order>', '<numbered>', 'B', 2),
  (v_quiz_id, 'List items are defined with?', '<li>', '<item>', '<list>', '<l>', 'A', 3),
  (v_quiz_id, 'Can lists be nested?', 'No', 'Yes', 'Only ordered', 'Only unordered', 'B', 4),
  (v_quiz_id, 'Default bullet style for <ul> is?', 'numbers', 'letters', 'disc', 'square', 'C', 5),
  (v_quiz_id, 'What is <dl> used for?', 'deleted list', 'description list', 'dynamic list', 'data list', 'B', 6),
  (v_quiz_id, '<dt> stands for?', 'data term', 'description term', 'delete term', 'define term', 'B', 7),
  (v_quiz_id, '<dd> is used for?', 'delete data', 'description definition', 'date data', 'dynamic definition', 'B', 8),
  (v_quiz_id, 'Can you style list bullets with CSS?', 'No', 'Yes', 'Only in HTML5', 'Only squares', 'B', 9),
  (v_quiz_id, 'Ordered lists show ___by default?', 'bullets', 'numbers', 'letters', 'dashes', 'B', 10),
  (v_quiz_id, 'The type attribute changes ___?', 'list color', 'list style', 'list size', 'list position', 'B', 11),
  (v_quiz_id, 'Can <ol> start from number other than 1?', 'No', 'Yes, with start attribute', 'Only with CSS', 'Not possible', 'B', 12),
  (v_quiz_id, 'Which is NOT a list type?', '<ul>', '<ol>', '<dl>', '<list>', 'D', 13),
  (v_quiz_id, 'Lists can contain ___?', 'only text', 'only links', 'any HTML content', 'only images', 'C', 14),
  (v_quiz_id, 'The reversed attribute works on?', '<ul>', '<ol>', '<dl>', 'all lists', 'B', 15);

  -- Lesson 5: Tables
  INSERT INTO public.lessons (course_id, title, description, content, video_url, order_index, duration_minutes)
  VALUES (
    v_course_id,
    'Tables',
    'Structure tabular data using HTML table elements',
    E'# HTML Tables\n\n## Basic Table Structure\n\n```html\n<table>\n  <tr>\n    <th>Name</th>\n    <th>Age</th>\n  </tr>\n  <tr>\n    <td>John</td>\n    <td>25</td>\n  </tr>\n  <tr>\n    <td>Jane</td>\n    <td>30</td>\n  </tr>\n</table>\n```\n\n## Table Elements\n\n- `<table>` - Defines the table\n- `<tr>` - Table row\n- `<th>` - Table header cell\n- `<td>` - Table data cell\n- `<thead>` - Groups header content\n- `<tbody>` - Groups body content\n- `<tfoot>` - Groups footer content\n\n## Spanning Cells\n\n### Colspan (merge columns)\n```html\n<td colspan="2">Spans 2 columns</td>\n```\n\n### Rowspan (merge rows)\n```html\n<td rowspan="2">Spans 2 rows</td>\n```\n\n## Best Practices\n\n- Use tables for tabular data, not layout\n- Always include `<th>` for headers\n- Use semantic structure (`<thead>`, `<tbody>`, `<tfoot>`)',
    'https://www.youtube.com/watch?v=6o7bM-JJ4h4',
    5,
    45
  ) RETURNING id INTO v_lesson5_id;

  INSERT INTO public.quizzes (lesson_id, title, pass_percentage)
  VALUES (v_lesson5_id, 'Tables Quiz', 60)
  RETURNING id INTO v_quiz_id;

  INSERT INTO public.quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES
  (v_quiz_id, 'Which tag defines a table?', '<tab>', '<table>', '<tbl>', '<grid>', 'B', 1),
  (v_quiz_id, '<tr> stands for?', 'table record', 'table row', 'table rule', 'table range', 'B', 2),
  (v_quiz_id, '<td> defines a ___?', 'table data cell', 'table definition', 'table delete', 'table description', 'A', 3),
  (v_quiz_id, '<th> is used for ___?', 'table height', 'table header', 'table help', 'table hide', 'B', 4),
  (v_quiz_id, 'colspan merges ___?', 'rows', 'columns', 'cells', 'tables', 'B', 5),
  (v_quiz_id, 'rowspan merges ___?', 'rows', 'columns', 'cells', 'headers', 'A', 6),
  (v_quiz_id, 'Should tables be used for page layout?', 'Yes, always', 'No, use CSS/divs', 'Only for complex layouts', 'Only for mobile', 'B', 7),
  (v_quiz_id, 'Which groups table header content?', '<thead>', '<tgroup>', '<header>', '<toptable>', 'A', 8),
  (v_quiz_id, '<tbody> is used for ___?', 'table borders', 'table body content', 'table background', 'table buttons', 'B', 9),
  (v_quiz_id, '<tfoot> represents ___?', 'table footer', 'table font', 'table form', 'table function', 'A', 10),
  (v_quiz_id, 'Can tables be nested?', 'No', 'Yes', 'Only 2 levels', 'Only with CSS', 'B', 11),
  (v_quiz_id, 'The border attribute is ___?', 'required', 'optional', 'deprecated', 'invalid', 'C', 12),
  (v_quiz_id, 'Tables are best for ___?', 'page layout', 'navigation', 'tabular data', 'images', 'C', 13),
  (v_quiz_id, 'Which is NOT a table element?', '<tr>', '<td>', '<th>', '<tp>', 'D', 14),
  (v_quiz_id, 'Can <th> be used in <tbody>?', 'No, only thead', 'Yes', 'Only with colspan', 'Only for first column', 'B', 15);

  -- Lesson 6: Forms & Inputs
  INSERT INTO public.lessons (course_id, title, description, content, video_url, order_index, duration_minutes)
  VALUES (
    v_course_id,
    'Forms & Inputs',
    'Create interactive forms with various input types',
    E'# HTML Forms\n\n## Form Structure\n\n```html\n<form action="/submit" method="post">\n  <label for="name">Name:</label>\n  <input type="text" id="name" name="name" required>\n  \n  <label for="email">Email:</label>\n  <input type="email" id="email" name="email" required>\n  \n  <button type="submit">Submit</button>\n</form>\n```\n\n## Input Types\n\n- `text` - Single-line text\n- `email` - Email address\n- `password` - Password field\n- `number` - Numeric input\n- `date` - Date picker\n- `checkbox` - Multiple choice\n- `radio` - Single choice\n- `file` - File upload\n\n## Form Elements\n\n### Textarea\n```html\n<textarea name="message" rows="4" cols="50"></textarea>\n```\n\n### Select Dropdown\n```html\n<select name="country">\n  <option value="us">United States</option>\n  <option value="uk">United Kingdom</option>\n</select>\n```\n\n## Validation\n\nUse HTML5 validation attributes:\n- `required` - Field must be filled\n- `minlength`, `maxlength` - Text length\n- `min`, `max` - Numeric range\n- `pattern` - Regex validation',
    'https://www.youtube.com/watch?v=fNcJuPIZ2WE',
    6,
    60
  ) RETURNING id INTO v_lesson6_id;

  INSERT INTO public.quizzes (lesson_id, title, pass_percentage)
  VALUES (v_lesson6_id, 'Forms Quiz', 60)
  RETURNING id INTO v_quiz_id;

  INSERT INTO public.quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES
  (v_quiz_id, 'Which tag creates a form?', '<input>', '<form>', '<field>', '<formdata>', 'B', 1),
  (v_quiz_id, 'The action attribute specifies ___?', 'form style', 'where to send data', 'form name', 'validation', 'B', 2),
  (v_quiz_id, 'Which input type is for passwords?', 'type="pass"', 'type="password"', 'type="secure"', 'type="hidden"', 'B', 3),
  (v_quiz_id, 'The <label> tag improves ___?', 'performance', 'accessibility', 'styling', 'security', 'B', 4),
  (v_quiz_id, 'Multi-line text input uses ___?', '<input>', '<text>', '<textarea>', '<multitext>', 'C', 5),
  (v_quiz_id, 'Dropdown lists use the ___ tag?', '<dropdown>', '<list>', '<select>', '<option>', 'C', 6),
  (v_quiz_id, 'Which makes a field required?', 'required="yes"', 'required', 'mandatory="true"', 'needed', 'B', 7),
  (v_quiz_id, 'Radio buttons allow ___?', 'multiple selections', 'single selection', 'no selection', 'text input', 'B', 8),
  (v_quiz_id, 'Checkboxes allow ___?', 'single selection', 'multiple selections', 'no selection', 'date input', 'B', 9),
  (v_quiz_id, 'The name attribute is used for ___?', 'display name', 'identifying data', 'styling', 'validation', 'B', 10),
  (v_quiz_id, 'File uploads use input type ___?', '"upload"', '"file"', '"attach"', '"document"', 'B', 11),
  (v_quiz_id, 'The method attribute can be ___?', 'GET or POST', 'only GET', 'only POST', 'SEND or RECEIVE', 'A', 12),
  (v_quiz_id, 'Which input type for email?', 'type="mail"', 'type="email"', 'type="e-mail"', 'type="address"', 'B', 13),
  (v_quiz_id, 'The placeholder attribute shows ___?', 'default value', 'hint text', 'label', 'validation message', 'B', 14),
  (v_quiz_id, 'Submit button type is ___?', 'type="send"', 'type="submit"', 'type="button"', 'type="ok"', 'B', 15);

  -- Lesson 7: CSS Introduction
  INSERT INTO public.lessons (course_id, title, description, content, video_url, order_index, duration_minutes)
  VALUES (
    v_course_id,
    'CSS Introduction',
    'Learn the basics of Cascading Style Sheets and styling',
    E'# Introduction to CSS\n\n## What is CSS?\n\nCSS (Cascading Style Sheets) is used to style and layout web pages. It controls colors, fonts, spacing, and positioning of HTML elements.\n\n## How to Add CSS\n\n### Inline CSS\n```html\n<p style="color: blue;">Blue text</p>\n```\n\n### Internal CSS\n```html\n<head>\n  <style>\n    p { color: blue; }\n  </style>\n</head>\n```\n\n### External CSS (Recommended)\n```html\n<head>\n  <link rel="stylesheet" href="styles.css">\n</head>\n```\n\n## CSS Syntax\n\n```css\nselector {\n  property: value;\n  property: value;\n}\n```\n\nExample:\n```css\np {\n  color: red;\n  font-size: 16px;\n  margin: 10px;\n}\n```\n\n## Selectors\n\n- Element: `p { }`\n- Class: `.classname { }`\n- ID: `#idname { }`\n- Universal: `* { }`\n- Group: `h1, h2, h3 { }`',
    'https://www.youtube.com/watch?v=yfoY53QXEnI',
    7,
    50
  ) RETURNING id INTO v_lesson7_id;

  INSERT INTO public.quizzes (lesson_id, title, pass_percentage)
  VALUES (v_lesson7_id, 'CSS Basics Quiz', 60)
  RETURNING id INTO v_quiz_id;

  INSERT INTO public.quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES
  (v_quiz_id, 'CSS stands for?', 'Computer Style Sheets', 'Cascading Style Sheets', 'Creative Style Sheets', 'Colorful Style Sheets', 'B', 1),
  (v_quiz_id, 'Which is the correct CSS syntax?', 'p {color: red}', '{p: color: red}', 'p: color=red', 'color: p=red', 'A', 2),
  (v_quiz_id, 'How to link external CSS?', '<stylesheet>', '<link rel="stylesheet">', '<css src="">', '<style href="">', 'B', 3),
  (v_quiz_id, 'Inline CSS uses the ___ attribute?', 'css', 'style', 'class', 'styles', 'B', 4),
  (v_quiz_id, 'Which selector selects by class?', '#classname', '.classname', 'classname', '*classname', 'B', 5),
  (v_quiz_id, 'Which selector selects by ID?', '.idname', '#idname', 'idname', '*idname', 'B', 6),
  (v_quiz_id, 'The universal selector is ___?', '#', '.', '*', '@', 'C', 7),
  (v_quiz_id, 'CSS comments use ___?', '// comment', '<!-- comment -->', '/* comment */', '# comment', 'C', 8),
  (v_quiz_id, 'Where is the best place for CSS?', 'Inline', 'Internal <style>', 'External file', 'JavaScript', 'C', 9),
  (v_quiz_id, 'Multiple elements can share ___?', 'only classes', 'only IDs', 'classes and IDs', 'neither', 'A', 10),
  (v_quiz_id, 'IDs should be ___?', 'reused multiple times', 'unique per page', 'in JavaScript only', 'avoided', 'B', 11),
  (v_quiz_id, 'CSS properties end with ___?', 'comma', 'semicolon', 'period', 'colon', 'B', 12),
  (v_quiz_id, 'Which has highest specificity?', 'element', 'class', 'ID', 'inline', 'D', 13),
  (v_quiz_id, 'CSS stands between ___?', 'HTML and JavaScript', 'HTML and database', 'JavaScript and PHP', 'server and client', 'A', 14),
  (v_quiz_id, 'Cascading means ___?', 'waterfall effect', 'styles inherit/override', 'animation', 'responsiveness', 'B', 15);

  -- Lesson 8: CSS Colors, Backgrounds, and Borders
  INSERT INTO public.lessons (course_id, title, description, content, video_url, order_index, duration_minutes)
  VALUES (
    v_course_id,
    'CSS Colors, Backgrounds, and Borders',
    'Master color systems, backgrounds, and border styling',
    E'# CSS Colors, Backgrounds, and Borders\n\n## Color Values\n\n### Named Colors\n```css\np { color: red; }\n```\n\n### Hex Colors\n```css\np { color: #FF0000; }\n```\n\n### RGB Colors\n```css\np { color: rgb(255, 0, 0); }\n```\n\n### RGBA (with transparency)\n```css\np { color: rgba(255, 0, 0, 0.5); }\n```\n\n## Backgrounds\n\n```css\ndiv {\n  background-color: lightblue;\n  background-image: url("image.jpg");\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: cover;\n}\n```\n\n## Borders\n\n```css\ndiv {\n  border: 2px solid black;\n  border-radius: 10px;\n  border-top: 3px dashed red;\n}\n```\n\n### Border Properties\n- `border-width` - Thickness\n- `border-style` - solid, dashed, dotted\n- `border-color` - Color\n- `border-radius` - Rounded corners',
    'https://www.youtube.com/watch?v=1PnVor36_40',
    8,
    40
  ) RETURNING id INTO v_lesson8_id;

  INSERT INTO public.quizzes (lesson_id, title, pass_percentage)
  VALUES (v_lesson8_id, 'CSS Styling Quiz', 60)
  RETURNING id INTO v_quiz_id;

  INSERT INTO public.quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES
  (v_quiz_id, 'Which color format uses transparency?', 'RGB', 'RGBA', 'Hex', 'Named', 'B', 1),
  (v_quiz_id, 'Hex color for white is ___?', '#000000', '#FFFFFF', '#FFF', 'Both B and C', 'D', 2),
  (v_quiz_id, 'RGB stands for?', 'Red Green Blue', 'Real Great Bold', 'Rounded Grid Box', 'Red Grey Black', 'A', 3),
  (v_quiz_id, 'Which property sets background color?', 'bg-color', 'background-color', 'bgcolor', 'color-bg', 'B', 4),
  (v_quiz_id, 'Background images use ___?', 'background-img', 'background-image', 'bg-image', 'image-bg', 'B', 5),
  (v_quiz_id, 'To prevent background repeat use ___?', 'repeat: no', 'background-repeat: no-repeat', 'no-repeat: true', 'repeat: none', 'B', 6),
  (v_quiz_id, 'border-radius creates ___?', 'round borders', 'rounded corners', 'circle borders', 'border rotation', 'B', 7),
  (v_quiz_id, 'Border shorthand order is ___?', 'color style width', 'width style color', 'style color width', 'any order', 'B', 8),
  (v_quiz_id, 'Dashed border style is ___?', 'border: dashed', 'border-style: dashed', 'border-type: dashed', 'border: line-dashed', 'B', 9),
  (v_quiz_id, 'To cover entire area use ___?', 'background-size: full', 'background-size: cover', 'background: full', 'size: cover', 'B', 10),
  (v_quiz_id, 'RGBA ''A'' stands for?', 'alignment', 'alpha (transparency)', 'angle', 'automatic', 'B', 11),
  (v_quiz_id, 'Which is NOT a border style?', 'solid', 'dashed', 'dotted', 'curved', 'D', 12),
  (v_quiz_id, 'Hex colors start with ___?', '@', '#', '$', '&', 'B', 13),
  (v_quiz_id, 'Can you set different border for each side?', 'No', 'Yes', 'Only top and bottom', 'Only with JavaScript', 'B', 14),
  (v_quiz_id, 'background-position centers with ___?', 'center center', 'middle middle', 'center', 'Any of these', 'D', 15);

  -- Lesson 9: CSS Box Model
  INSERT INTO public.lessons (course_id, title, description, content, video_url, order_index, duration_minutes)
  VALUES (
    v_course_id,
    'CSS Box Model',
    'Understand the CSS box model and element spacing',
    E'# CSS Box Model\n\n## The Box Model\n\nEvery HTML element is a rectangular box with:\n\n1. **Content** - The actual content\n2. **Padding** - Space inside the border\n3. **Border** - Border around padding\n4. **Margin** - Space outside the border\n\n```\n+------------------------+\n|       Margin           |\n|  +------------------+  |\n|  |    Border        |  |\n|  |  +------------+  |  |\n|  |  |  Padding   |  |  |\n|  |  |  +------+  |  |  |\n|  |  |  |Content  |  |  |\n|  |  |  +------+  |  |  |\n|  |  +------------+  |  |\n|  +------------------+  |\n+------------------------+\n```\n\n## CSS Properties\n\n```css\ndiv {\n  /* Content size */\n  width: 300px;\n  height: 200px;\n  \n  /* Padding (inside) */\n  padding: 20px;\n  \n  /* Border */\n  border: 2px solid black;\n  \n  /* Margin (outside) */\n  margin: 10px;\n}\n```\n\n## Individual Sides\n\n```css\npadding-top: 10px;\npadding-right: 20px;\npadding-bottom: 10px;\npadding-left: 20px;\n\n/* Shorthand: top right bottom left */\npadding: 10px 20px 10px 20px;\n```\n\n## Box Sizing\n\n```css\n/* Include padding and border in width */\nbox-sizing: border-box;\n```',
    'https://www.youtube.com/watch?v=rIO5326FgPE',
    9,
    45
  ) RETURNING id INTO v_lesson9_id;

  INSERT INTO public.quizzes (lesson_id, title, pass_percentage)
  VALUES (v_lesson9_id, 'Box Model Quiz', 60)
  RETURNING id INTO v_quiz_id;

  INSERT INTO public.quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES
  (v_quiz_id, 'The box model consists of ___?', 'content only', 'content, padding, border', 'content, padding, border, margin', 'border and margin', 'C', 1),
  (v_quiz_id, 'Padding is space ___?', 'outside border', 'inside border', 'around content', 'between elements', 'B', 2),
  (v_quiz_id, 'Margin is space ___?', 'inside border', 'outside border', 'inside content', 'inside padding', 'B', 3),
  (v_quiz_id, 'Which is innermost in box model?', 'margin', 'border', 'padding', 'content', 'D', 4),
  (v_quiz_id, 'padding: 10px applies to ___?', 'top only', 'top and bottom', 'left and right', 'all sides', 'D', 5),
  (v_quiz_id, 'margin: 10px 20px sets ___?', 'all sides equal', 'top/bottom 10px, left/right 20px', 'left/right 10px, top/bottom 20px', 'random', 'B', 6),
  (v_quiz_id, 'box-sizing: border-box includes ___?', 'only content in width', 'content and padding in width', 'content, padding, border in width', 'everything', 'C', 7),
  (v_quiz_id, 'Default box-sizing is ___?', 'border-box', 'content-box', 'padding-box', 'margin-box', 'B', 8),
  (v_quiz_id, 'Negative margins are ___?', 'invalid', 'allowed', 'only for divs', 'only top/left', 'B', 9),
  (v_quiz_id, 'Margin collapse happens ___?', 'never', 'between vertical margins', 'between horizontal margins', 'inside padding', 'B', 10),
  (v_quiz_id, 'Width property affects ___?', 'margin', 'border', 'padding', 'content', 'D', 11),
  (v_quiz_id, 'Padding shorthand order is ___?', 'left right top bottom', 'top right bottom left', 'top bottom left right', 'any order', 'B', 12),
  (v_quiz_id, 'Can padding be negative?', 'Yes', 'No', 'Only top', 'Only bottom', 'B', 13),
  (v_quiz_id, 'Total element width includes ___?', 'only content width', 'content + padding', 'content + padding + border', 'content + padding + border + margin', 'D', 14),
  (v_quiz_id, 'Auto margins are useful for ___?', 'removing margins', 'centering elements', 'full width', 'borders', 'B', 15);

  -- Lesson 10: CSS Layouts (Flexbox & Grid)
  INSERT INTO public.lessons (course_id, title, description, content, video_url, order_index, duration_minutes)
  VALUES (
    v_course_id,
    'CSS Layouts (Flexbox & Grid Basics)',
    'Learn modern CSS layout techniques with Flexbox and Grid',
    E'# CSS Layouts\n\n## Display Property\n\n```css\ndiv {\n  display: block;    /* Full width */\n  display: inline;   /* Inline with text */\n  display: flex;     /* Flexbox */\n  display: grid;     /* Grid */\n  display: none;     /* Hide */\n}\n```\n\n## Flexbox Basics\n\nFlexbox arranges items in one dimension (row or column):\n\n```css\n.container {\n  display: flex;\n  flex-direction: row;  /* or column */\n  justify-content: center;  /* horizontal align */\n  align-items: center;      /* vertical align */\n  gap: 10px;               /* space between items */\n}\n```\n\n### Common Properties\n- `flex-direction`: row, column\n- `justify-content`: flex-start, center, flex-end, space-between\n- `align-items`: flex-start, center, flex-end, stretch\n- `flex-wrap`: wrap, nowrap\n\n## Grid Basics\n\nGrid creates two-dimensional layouts:\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: 1fr 1fr 1fr;  /* 3 equal columns */\n  grid-template-rows: 100px 200px;     /* 2 rows */\n  gap: 20px;                           /* spacing */\n}\n```\n\n## Responsive Layouts\n\nFlexbox and Grid make responsive design easier:\n\n```css\n.container {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n}\n```',
    'https://www.youtube.com/watch?v=JJSoEo8JSnc',
    10,
    60
  ) RETURNING id INTO v_lesson10_id;

  INSERT INTO public.quizzes (lesson_id, title, pass_percentage)
  VALUES (v_lesson10_id, 'CSS Layouts Quiz', 60)
  RETURNING id INTO v_quiz_id;

  INSERT INTO public.quiz_questions (quiz_id, question, option_a, option_b, option_c, option_d, correct_answer, order_index) VALUES
  (v_quiz_id, 'display: flex creates ___?', 'grid layout', 'flexbox layout', 'block layout', 'table layout', 'B', 1),
  (v_quiz_id, 'Flexbox arranges items in ___?', 'one dimension', 'two dimensions', 'three dimensions', 'no dimension', 'A', 2),
  (v_quiz_id, 'Grid arranges items in ___?', 'one dimension', 'two dimensions', 'rows only', 'columns only', 'B', 3),
  (v_quiz_id, 'flex-direction: row arranges items ___?', 'vertically', 'horizontally', 'diagonally', 'randomly', 'B', 4),
  (v_quiz_id, 'justify-content works on ___?', 'vertical axis', 'horizontal axis (main)', 'both axes', 'neither', 'B', 5),
  (v_quiz_id, 'align-items works on ___?', 'main axis', 'cross axis', 'both axes', 'neither', 'B', 6),
  (v_quiz_id, 'grid-template-columns defines ___?', 'row sizes', 'column sizes', 'gaps', 'borders', 'B', 7),
  (v_quiz_id, '1fr in Grid means ___?', '1 pixel', '1 fraction of space', '1 foot', '1 rem', 'B', 8),
  (v_quiz_id, 'gap property sets ___?', 'border gaps', 'space between items', 'padding', 'margin', 'B', 9),
  (v_quiz_id, 'flex-wrap: wrap allows items to ___?', 'stay in one line', 'move to next line', 'overlap', 'hide', 'B', 10),
  (v_quiz_id, 'Which centers items in Flexbox?', 'align: center', 'justify-content: center', 'center: true', 'middle: center', 'B', 11),
  (v_quiz_id, 'repeat() function is used in ___?', 'Flexbox', 'Grid', 'Block', 'Inline', 'B', 12),
  (v_quiz_id, 'display: none makes element ___?', 'invisible but space remains', 'completely removed from layout', 'transparent', 'smaller', 'B', 13),
  (v_quiz_id, 'space-between in justify-content ___?', 'equal space between items', 'space at start', 'space at end', 'no space', 'A', 14),
  (v_quiz_id, 'Grid is better for ___?', 'one-line layouts', 'complex 2D layouts', 'text only', 'images only', 'B', 15);

END $$;