import { useState } from "react";
import "./Editor.css";
import Category from "./Category";
import Button from "./Button";
import { useNavigate } from "react-router-dom";

const getStringedDate = (targetDate) => {
  let year = targetDate.getFullYear();
  let month = targetDate.getMonth() + 1;
  let date = targetDate.getDate();

  if (month < 10) {
    month = `0${month}`;
  }
  if (date < 10) {
    date = `0${date}`;
  }

  return `${year}-${month}-${date}`;
};

const Editor = ({ onSubmit }) => {
  const [input, setInput] = useState({
    image: null,
    productName: "",
    category: "",
    content: "",
    possibleDate: new Date(),
    price: "",
  });
  const nav = useNavigate();

  const onChangeInput = (e) => {
    let name = e.target.name;
    let value = e.target.value;

    if (name === "possibleDate") {
      value = new Date(value);
    }

    setInput({
      ...input,
      [name]: value,
    });
  };

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedButton, setSelectedButton] = useState(null);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  const handleButtonClick = (buttonType) => {
    setSelectedButton(buttonType);
  };

  const onClickSubmitButton = () => {
    onSubmit(input);
  };

  const categories = ["서적", "생활용품", "전자제품", "의류", "잡화", "기타"];

  return (
    <div className="Editor">
      <section className="upload_section">
        <input
          type="file"
          accept="image*"
          onChange={(e) => {
            const file = e.target.files[0];
            setInput({
              ...input,
              image: file,
            });
          }}
        />
      </section>
      <section className="product_section">
        <h4> 상품명| </h4>
        <input
          name="productName"
          value={input.productName}
          onChange={onChangeInput}
          type="text"
        />
      </section>
      <section className="category_section">
        <h4> 카테고리 </h4>
        <div className="category_list">
          {categories.map((category) => (
            <Category
              key={category}
              categoryName={category}
              isSelected={input.category === category}
              onClick={() => {
                setInput({
                  ...input,
                  category, // 선택된 카테고리를 상태에 저장
                });
              }}
            />
          ))}
        </div>
      </section>
      <section className="content_section">
        <h4>상세설명</h4>
        <textarea
          name="content"
          value={input.content}
          onChange={onChangeInput}
          placeholder="상품에 대한 상세설명을 적어주세요"
        />
      </section>
      <section className="date_section">
        <h4>거래/반납 날짜</h4>
        <input
          name="possibleDate"
          onChange={onChangeInput}
          value={getStringedDate(input.possibleDate)}
          type="date"
        />
      </section>
      <section className="price_section">
        <h4>판매/보증 금액|</h4>
        <input
          name="price"
          value={input.price}
          onChange={onChangeInput}
          type="text"
        />
      </section>
      <section className="button_section">
        <Button
          text={"취소하기"}
          isSelected={selectedButton === "cancel"}
          onClick={() => {
            handleButtonClick("cancel");
            nav("/");
          }}
        />
        <Button
          text={"등록하기"}
          isSelected={selectedButton === "submit"}
          onClick={() => {
            handleButtonClick("submit");
            onClickSubmitButton();
          }}
        />
      </section>
    </div>
  );
};

export default Editor;
