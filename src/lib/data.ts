import type { LucideIcon } from "lucide-react";
import { Code, GitBranch, Layers3 } from "lucide-react";

export type Step = {
  title: string;
  content: string;
};

export type Guide = {
  slug: string;
  title: string;
  description: string;
  category: string;
  steps: Step[];
};

export type Category = {
  slug: string;
  title:string;
  description: string;
  iconName: "Code" | "Layers3" | "GitBranch";
};

export const categories: Category[] = [
  {
    slug: "frontend-basics",
    title: "Frontend Basics",
    description: "The building blocks of web development.",
    iconName: "Code",
  },
  {
    slug: "react-hooks",
    title: "React Hooks",
    description: "Master functional components and state management.",
    iconName: "Layers3",
  },
  {
    slug: "version-control",
    title: "Version Control with Git",
    description: "Learn how to manage your code with Git.",
    iconName: "GitBranch",
  },
];

export const guides: Guide[] = [
  {
    slug: "html-essentials",
    title: "HTML Essentials",
    description: "Learn the structure of web pages with HTML.",
    category: "frontend-basics",
    steps: [
      {
        title: "Introduction to HTML",
        content: "HTML (HyperText Markup Language) is the standard language for creating web pages. It describes the structure of a web page.",
      },
      {
        title: "Basic Tags",
        content: "Learn about essential tags like <html>, <head>, <title>, <body>, <h1>-<h6>, <p>, <a>, and <img>.",
      },
      {
        title: "Lists and Tables",
        content: "Understand how to create ordered (<ol>), unordered (<ul>), and definition (<dl>) lists, as well as tables (<table>).",
      },
    ],
  },
  {
    slug: "css-fundamentals",
    title: "CSS Fundamentals",
    description: "Style your web pages with CSS.",
    category: "frontend-basics",
    steps: [
      {
        title: "What is CSS?",
        content: "CSS (Cascading Style Sheets) is used to style and lay out web pages — for example, to alter the font, color, size, and spacing of your content.",
      },
      {
        title: "Selectors and Properties",
        content: "Learn how to target HTML elements with selectors (like class, ID, and element selectors) and apply styling properties.",
      },
      {
        title: "The Box Model",
        content: "Understand the CSS box model, which is a box that wraps around every HTML element. It consists of: margins, borders, padding, and the actual content.",
      },
    ],
  },
  {
    slug: "usestate-hook",
    title: "The useState Hook",
    description: "Manage component state with useState.",
    category: "react-hooks",
    steps: [
      {
        title: "Introduction to State",
        content: "State allows React components to change their output over time in response to user actions, network responses, and anything else.",
      },
      {
        title: "Using useState",
        content: "Learn the syntax: `const [state, setState] = useState(initialState);`. We'll explore how to declare, read, and update state variables.",
      },
      {
        title: "State in Practice",
        content: "Build a simple counter component to see `useState` in action.",
      },
    ],
  },
  {
    slug: "useeffect-hook",
    title: "The useEffect Hook",
    description: "Handle side effects in your components.",
    category: "react-hooks",
    steps: [
      {
        title: "Understanding Side Effects",
        content: "Side effects are operations that can affect other components or can’t be done during rendering, like data fetching, subscriptions, or manually changing the DOM.",
      },
      {
        title: "Using useEffect",
        content: "Learn the syntax: `useEffect(() => { /* side effect */ }, [dependencies]);`. We'll cover how the dependency array works.",
      },
      {
        title: "Cleanup with useEffect",
        content: "Explore how to return a cleanup function from your effect to prevent memory leaks, for example, by unsubscribing from a data source.",
      },
    ],
  },
  {
    slug: "git-basics",
    title: "Git Basics",
    description: "Get started with the most popular version control system.",
    category: "version-control",
    steps: [
        {
            title: "Installation and Setup",
            content: "How to install Git on your system and configure your username and email."
        },
        {
            title: "Creating a Repository",
            content: "Learn to initialize a new Git repository using `git init`."
        },
        {
            title: "Basic Commands",
            content: "Understand `git add`, `git commit`, and `git status` to track and save your changes."
        }
    ]
  }
];