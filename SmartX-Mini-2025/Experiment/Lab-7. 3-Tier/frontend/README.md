# 3-Tier Lab: FrontEnd 설명서
※ 본 프로젝트는 3-Tier 구조를 체험하기 위해, 최소한의 동작만 가능하도록 구현되었다는 점을 참고할 것.
## 프로젝트 개발
### 개발 환경 구성
- 먼저, 자신의 개발환경에 Node.js 및 npm 설치 여부를 확인한다.
  - 본 프로젝트는 Node.js v22.14.0 및 npm 10.9.2를 사용하였다.
  - 최소한 Node.js의 메이저 버전(이 경우 v22.x.x)을 일치시킬 것을 권장하며, npm의 버전은 오류 발생 시에 참고한다.
  - [Node.js 공식 홈페이지](https://nodejs.org/ko/download)를 참고하여 설치를 진행한다.
- 설치 후, `npm install`을 실행하여 의존성을 다운로드한다.
  - 다운로드되는 패키지는 `package.json`을 참고한다.
### 개발 진행 및 빌드 수행
- `npm run dev`를 통해 React 프로젝트의 결과물을 확인할 수 있다.
  - 파일 변경을 감지하여 실시간으로 반영하므로 참고한다.
- 작업 완료 후, `npm run build`를 실행하여 단일 파일로 가공한다. 이를 백엔드 서버의 Static File로 전달하여 활용한다.
  - 이를 실행할 경우 `dist` 경로에 결과물이 생성된다.
- `npm run <cmd>`로 실행되는 코드는 `package.json`의 `scripts.<cmd>`를 참고한다.

## 디렉토리 구조도
- 코드 설명 상세는 파일 내 주석과 후술할 "React 기초"를 참고한다.
```text
frontend
├─ dist: `npm run build`으로 생성된 HTML, CSS, JS 파일이 저장된다. 
├─ node_modules: React 개발 프로젝트 진행에 필요한 의존성 패키지가 저장된다. `npm install` 실행 시 해당 디렉토리가 생성된다.
├─ public: 웹페이지에 포함될 이미지(.img, .svg 등)나 css 등이 포함된다.
├─ src: React 프로젝트의 소스코드를 저장/관리하는 디렉토리.
│   ├─ asset: 소스코드에서 활용할 여러 static 파일을 저장한다.
│   ├─ component: 버튼이라 Table의 Row, 댓글창의 단일 댓글 등 소규모 공통 요소들을 관리하는 디렉토리.
│   │   ├─ CommmentItem.jsx: 댓글 목록에 포함되는, 단일 댓글을 의미한다.
│   │   ├─ CreatePost.jsx: 게시글 작성 화면.
│   │   ├─ EditPost.jsx: 게시글 수정 화면.
│   │   ├─ PostDetail.jsx: 단일 게시글 조회 화면. CommentItem.jsx을 이용하여 댓글 목록을 구현한다.
│   │   └─ PostList.jsx: 게시글 목록 조회 화면.
│   ├─ api.js: HTTP Client 패키지인 axios를 사용하기 좋은 형태로 가공한 파일. Web에서 HTTP 요청을 보낼 때 이를 활용한다.
│   ├─ App.jsx: React App.의 Root에 해당하는 부분. 본 프로젝트에서는 Client Side Routing을 정의하기 위해 사용된다.
│   └─ main.jsx: React App.를 실제로 HTML에 Load해주는 요소. 가령, `index.html` 파일을 브라우저가 전달받은 경우, 
│             이를 이용하여 `<div id="root"></div>`에 React App.을 로드하는 역할을 수행한다.
├─ index.html: Base HTML 파일. 해당 페이지가 React의 JS 코드를 다운로드하여 React App.이 브라우저에 호출되도록 한다.
├─ Dockerfile: 프로젝트 빌드 결과물을 포함한 NGINX 이미지를 빌드하는 데이 쓰이는 파일이다.
│        `app.conf` 파일을 복제하는 코드가 주석처리 되어있으니 참고한다.
└─ app.conf: NGINX에서 HTML 파일을 서빙하는 데에 쓰이는 설정 파일 샘플.
```

## React 기초
### JSX 확장자
- 기존 JavaScript 문법에 Markup 문법을 추가하여, HTML과 비슷한 표현을 사용할 수 있도록 JavaScript의 문법을 확장한 것.
  ```javascript
  const element1 = <a href="https://www.reactjs.org"> link </a>; // 속성 정의 시 리터럴 사용
  const element2 = <img src={user.avatarUrl}></img>;             // 속성 정의 시 JS 표현식 사용
  const element3 = <img src={user.avatarUrl} />;                 // Close Tag가 없는 경우
  ```
  - 가령, 본 프로젝트의 `.jsx` 파일을 보면 알 수 있다시피, JS 문법을 중심으로 `<Link>`나 `<Route>`, `<p>`와 같은 HTML 태그와 유사한 요소들이 포함되어있는 걸 볼 수 있다.
- React App. 프로젝트에서 하나의 Component가 하나의 HTML Element를 생성하기 때문에, JSX 형식을 활용하면 개발자 입장에서 나은 가독성을 얻을 수 있으며, 오류를 발견하는 데에 도움을 준다는 점에서 용이하게 쓰인다.
  - 물론 `.js`로 HTML Element를 생성할 수도 있지만, 상당히 귀찮은 작업을 요구한다.
  - Component는 하단의 "Parent/Child Component 간 상호작용을 위한 Prop Drilling"에서 조금 더 기술한다.
- `.jsx`로 정의한 요소는 React Element 객체로 변환되며, 이를 React App.에 활용한다.
- 조금 더 자세한 사항은 다음의 페이지를 참고한다.
  - [JSX 소개(KO; Legacy)](https://ko.legacy.reactjs.org/docs/introducing-jsx.html)
  - [Writing Markup with JSX(EN)](https://react.dev/learn/writing-markup-with-jsx)

### Hook: `useState()`와 `useEffect()`
- React에서 Hook이란 함수형 컴포넌트가 재랜더링 등으로 다시 호출되는 상황에서도 자신의 값을 Class처럼 유지할 수 있는 기능을 의미한다.
  - 클래스 컴포넌트는 자신의 멤버변수를 통해 값을 유지하는 반면, 함수형 컴포넌트는 그러한 요소가 없어 값을 유지할 수 없었다.
  - 하지만 Hook 기능이 도입되면서 함수형 컴포넌트라도 값을 유지할 수 있게 되었다.
- 본 프로젝트는 `useState()`와 `useEffect()`만을 사용하므로, 이것만을 설명한다.
  - 이 외에도 `useRef`, `useContext`, `useMemo` 등이 존재하므로 필요할 경우 추가로 찾아본다.
- `useState()`는 각 컴포넌트의 상태값을 유지하기 위해 활용된다.
  - 다음과 같이 정의된다.
    ```javascript
    import { useState } from 'react';

    const [state, setState] = useState(초기값);
    // state: 값이 저장되는 곳
    // setState: 값을 수정하기 위한 함수
    // state에 변화가 발생할 경우, 이를 포함하는 컴포넌트가 다시 랜더링된다.
    // 초기값 설정을 위해 함수를 호출해야 할 경우, ()=>{함수()} 형식으로, 즉 람다 함수로 Wrapping하여 함수를 실행해야 단 한번만 실행된다.
    ```
- `useEffect`는 Component가 처음 배치되는 상황, 혹은 특정 조건마다 실행되어야 할 처리를 지정하기 위해 사용된다.
  - 다음과 같은 방식으로 활용된다.
    ```javascript
    import { useEffect } from 'react';

    // 컴포넌트가 처음 랜더링될 때 실행할 코드를 지정한다.
    useEffect(()=>{
    	/* 랜더링할 때 실행할 코드 */
    })

    // Dependency Array를 추가로 제공.
    // 제공한 배열에 들어있는 변수가 변할 때마다 콜백이 동작함. (보통 State 삽입)
    // 빈 배열을 제공하면 처음 랜더링 될 때에만 실행이 됨 (Mount와 동일)
    useEffect(()=>{
    	/* 배열에 지정한 값이 바뀔 때마다 실행할 코드 */
    }, [value]) 
    ```
- 자세한 설명은 [React 공식 페이지: Built-in React Hooks](https://react.dev/reference/react/hooks)를 참고한다.
### Client Side Routing과 `<Link>`, `<Route>`에 대해
- React App.은 SPA(Single Page Application)로, 단일 정적 페이지만을 다운로드하고, 나머지는 JS를 활용하여 동적으로 페이지를 생성하는 방식을 취한다.
  - 여러 그림판을 겹치며 사용하는 대신, 하나의 그림판을 사용하되 필요에 따라 그림을 지우고, 새로운 재료를 가져와 그림을 새로 그리는 방식을 취한다고 이해하면 된다.
- 전통적인 웹서비스의 경우, 특정 Path의 웹페이지를 요청하면 이에 맞는 HTML 파일을 전달하는 방식으로 운영했다. 즉, Server가 주도하여 요청한 Path에 알맞는 웹페이지를 제공하는 방식이 Server Side Routing이다.
- 하지만 React처럼 필요한 데이터만 Server에게 제공받아 직접 페이지를 그리는 방식의 경우, 특정 Path에 대한 페이지 이동을 Client가 직접 수행하게 된다. 이처럼 Client 주도로 Path에 대한 페이지 이동을 수행하는 방식을 Client Side Routing이라고 한다.
- React의 경우 CSR 처리를 위해 `react-router`, 혹은 `react-router-dom`을 활용한다.
  - `react-router`는 Web 이외에 모바일 등에서 활용 가능한 범용 라이브러리지만, `react-router-dom`은 Web의 환경에 맞추어 Routing을 수행하는 라이브러리이다.
- HTML의 `<a>` 등을 사용하는 대신, `<Link>`로 CSR 방식에 맞는 경로 이동을 수행하고, `<Route>`로 경로와 일치하는 Element를 제공하는 방식을 취한다.
  - `main.jsx`를 보면 `<BrowserRouter>`를 볼 수 있는데, 해당 Element가 Path에 대해 적절한 컴포넌트를 찾아 페이지를 만들어준다.
  - `App.jsx`를 보면 `<Link>`를 볼 수 있는데, 이는 `<BrowserRouter>`가 인식할 수 있는 형태로 Path를 전달하는 Element이다.
  - 또한, `<Routes>`와 `<Route>`를 볼 수 있는데, 이는 제공된 Path에 대해 생성해야 할 Compoenent를 정의하는 공간이다. `<BrowserRouter>`는 `<Routes>`의 정보를 보고, 제공된 Path에 적절한 Component를 선택하게 된다.
- 자세한 사항은 [React Router 공식 홈페이지](https://reactrouter.com/start/modes)를 참고한다.

### Parent/Child Component 간 상호작용을 위한 Prop Drilling
- React App.은 Component(이하 컴포넌트)로 구성되며, 하나의 컴포넌트는 다수의 하위 컴포넌트를 포함하여 이루어진다.
  - 여기서 "컴포넌트"는 사용자 인터페이스(User Interface; UI)를 구성하는 일부분으로, 이를 생성/유지하기 위한 고유의 로직과 모양, 데이터로 구성된다.
  - 하나의 웹페이지도 컴포넌트이며, 해당 페이지가 포함하는 버튼이나 글 목록, 목차나 바로가기 또한 이의 하위 컴포넌트로 제작할 수 있다.
  - React Component는 Class 정의 방식과 Function 정의 방식으로 나뉘는데, 대부분의 경우 Function 방식을 사용한다.
  - OOP에서 단일 객체 인스턴스가 자신의 멤버변수로 다른 인스턴스를 소유하는 관계를 떠올리면 된다.
  - 컴포넌트에 대한 자세한 사항은 [React: Your First Component](https://react.dev/learn/your-first-component)를 참고한다.
- 이러한 상하 관계에 따라 Parent Component와 Child Component로 나뉜다.
- 이때, 많은 경우 Parent와 Child 간 소통이 필요하거나, 여러 Child 간 소통이 필요하게 된다.
  - 이러한 경우, Parent에서 Data나 Method를 Child에게 전달하여, Child가 전달받은 Method를 통해 Parent의 데이터를 변경하거나, Parent로부터 전달받은 Data를 이용해 Child를 구성할 수도 있다.
  - 이처럼 상위 컴포넌트가 하위 컴포넌트에게 데이터나 메서드를 내려 보내주는 방식을 <ins>Prop Drilling</ins>라고 한다.
  - 각 컴포넌트가 주로 함수 형태로 정의된다는 점을 이용하여, 함수의 인자로 필요한 메서드나 데이터를 보내는 방식으로 행해진다.
  - UNIX에서 Parent와 Child Process 간 통신을 위해 Pipe를 생성해 전달하는 것과 비슷한 방식이다.
- 이때, Prop Drilling의 깊이가 너무 깊어질 수 있다는 문제점이 있으며, 이를 완화하고자 `useContext()`나 Recoil과 같은 상태 관리 라이브러리 등을 활용하기도 한다.
- Prop Drilling에 대한 자세한 사항은 [Medium 글](https://phungnc.medium.com/react-from-prop-drilling-to-use-hook-to-pass-data-in-app-3e3caad6a65f)을 참고하기 바란다.



# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.