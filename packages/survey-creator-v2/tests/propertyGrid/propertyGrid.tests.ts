import {
  PropertyGridModel,
  PropertyGridEditorCollection,
} from "../../src/propertyGrid/propertygrid";
import {
  Base,
  QuestionTextModel,
  QuestionCheckboxModel,
  QuestionDropdownModel,
  QuestionMatrixDynamicModel,
  PanelModel,
  SurveyModel,
  SurveyTriggerRunExpression,
  ExpressionValidator,
} from "survey-knockout";
import { assert } from "console";
export * from "../../src/propertyGrid/propertygrid_matrices";
export * from "../../src/propertyGrid/propertygtrid_condition";

export class PropertyGridModelTester extends PropertyGridModel {
  constructor(obj: Base) {
    PropertyGridEditorCollection.clearHash();
    super(obj);
  }
}
test("Create survey with editingObj", () => {
  var question = new QuestionTextModel("q1");
  var propertyGrid = new PropertyGridModelTester(question);
  expect(propertyGrid.survey.getValue("name")).toEqual("q1");
  var nameQuestion = propertyGrid.survey.getQuestionByName("name");
  expect(nameQuestion).toBeTruthy();
  expect(nameQuestion.title).toEqual("Name");
  nameQuestion.value = "q2";
  expect(question.name).toEqual("q2");
});
test("Check tabs creating", () => {
  var question = new QuestionCheckboxModel("q1");
  var propertyGrid = new PropertyGridModelTester(question);
  var generalPanel = <PanelModel>propertyGrid.survey.getPanelByName("general");
  expect(generalPanel).toBeTruthy();
  expect(generalPanel.title).toEqual("General");
  var choicesPanel = <PanelModel>propertyGrid.survey.getPanelByName("choices");
  expect(choicesPanel).toBeTruthy();
  expect(choicesPanel.title).toEqual("Choices");
});
test("Hide question title if property is first in tab and has the same title as tab", () => {
  var question = new QuestionCheckboxModel("q1");
  var propertyGrid = new PropertyGridModelTester(question);
  var choicesQuestion = propertyGrid.survey.getQuestionByName("choices");
  expect(choicesQuestion).toBeTruthy();
  expect(choicesQuestion.titleLocation).toEqual("hidden");
});

test("boolean property editor (boolean/switch)", () => {
  var question = new QuestionTextModel("q1");
  var propertyGrid = new PropertyGridModelTester(question);
  var startWithNewLineQuestion = propertyGrid.survey.getQuestionByName(
    "startWithNewLine"
  );
  var isRequiredQuestion = propertyGrid.survey.getQuestionByName("isRequired");
  expect(startWithNewLineQuestion).toBeTruthy(); //"property for startWithNewLine is created"
  expect(isRequiredQuestion).toBeTruthy(); // "property for isRequired is created"
  expect(startWithNewLineQuestion.getType()).toEqual("boolean"); // "property for startWithNewLine is created"
  expect(isRequiredQuestion.getType()).toEqual("boolean"); // "property for isRequired is created"
  expect(startWithNewLineQuestion.value).toEqual(true); // "startWithNewLine default value is true"
  expect(isRequiredQuestion.value).toEqual(false); //"isRequired default value is false"
  question.isRequired = true;
  expect(isRequiredQuestion.value).toEqual(true); //"isRequired is true now");
  isRequiredQuestion.value = false;
  expect(question.isRequired).toEqual(false); //"isRequired is false again - two way bindings"
});
test("dropdown property editor", () => {
  var question = new QuestionTextModel("q1");
  var propertyGrid = new PropertyGridModelTester(question);
  var titleLocationQuestion = propertyGrid.survey.getQuestionByName(
    "titleLocation"
  );
  expect(titleLocationQuestion.getType()).toEqual("dropdown"); //"correct property editor is created"
  expect(titleLocationQuestion.choices.length).toEqual(5); // "There are five choices"
  expect(titleLocationQuestion.value).toEqual("default"); //"the value is correct"
  question.titleLocation = "top";
  expect(titleLocationQuestion.value).toEqual("top"); //"property editor react on value chage"
  titleLocationQuestion.value = "bottom";
  expect(question.titleLocation).toEqual("bottom"); //"property editor change the question property"
});
test("dropdown property editor localization", () => {
  var survey = new SurveyModel();
  var propertyGrid = new PropertyGridModelTester(survey);
  var showPreviewQuestion = propertyGrid.survey.getQuestionByName(
    "showPreviewBeforeComplete"
  );
  expect(showPreviewQuestion.getType()).toEqual("dropdown"); //"correct property editor is created"
  expect(showPreviewQuestion.choices[0].value).toEqual("noPreview");
  expect(showPreviewQuestion.choices[0].text).toEqual("no preview");

  var localeQuestion = propertyGrid.survey.getQuestionByName("locale");
  expect(localeQuestion.getType()).toEqual("dropdown"); //"correct property editor is created"
  expect(localeQuestion.choices[0].value).toEqual("");
  expect(localeQuestion.choices[0].text).toEqual("Default (english)");
});

test("itemvalue[] property editor", () => {
  var question = new QuestionDropdownModel("q1");
  question.choices = [1, 2, 3];
  var propertyGrid = new PropertyGridModelTester(question);
  var choicesQuestion = <QuestionMatrixDynamicModel>(
    propertyGrid.survey.getQuestionByName("choices")
  );
  expect(choicesQuestion).toBeTruthy(); //"choices property editor created");
  expect(choicesQuestion.getType()).toEqual("matrixdynamic"); //"It is a matrix");
  expect(choicesQuestion.columns).toHaveLength(2); //"There are two columns");
  expect(choicesQuestion.visibleRows).toHaveLength(3); //"There are three elements"
  expect(choicesQuestion.visibleRows[0].cells[0].value).toEqual(1); //"the first cell value is 3"
  choicesQuestion.addRow();
  expect(question.choices).toHaveLength(4); // "There are 4 items now");
  expect(question.choices[3].getType()).toEqual("itemvalue"); //correct class created
  expect(choicesQuestion.visibleRows[3].cells[0].value).toEqual(4);
  expect(question.choices[3].value).toEqual(4); //"The last item value is 4");
  question.choices[1].text = "Item 2";
  expect(choicesQuestion.visibleRows[1].cells[1].value).toEqual("Item 2"); // "the second cell in second row is correct"
  question.choices[2].value = 333;
  expect(choicesQuestion.visibleRows[2].cells[0].value).toEqual(333); //"the first cell in third row is correct"
});
test("itemvalue[] property editor + detail panel", () => {
  var question = new QuestionDropdownModel("q1");
  question.choices = [1, 2, 3];
  var propertyGrid = new PropertyGridModelTester(question);
  var choicesQuestion = <QuestionMatrixDynamicModel>(
    propertyGrid.survey.getQuestionByName("choices")
  );
  var row = choicesQuestion.visibleRows[0];
  expect(row.hasPanel).toEqual(true); //"There is a detail panel here");
  row.showDetailPanel();
  expect(row.detailPanel).toBeTruthy(); //"Detail panel is showing");
  expect(row.detailPanel.getQuestionByName("value")).toBeTruthy(); //"value property is here"
});

test("column[] property editor", () => {
  var question = new QuestionMatrixDynamicModel("q1");
  question.addColumn("col1");
  question.addColumn("col2");
  question.addColumn("col3");
  var propertyGrid = new PropertyGridModelTester(question);
  var columnsQuestion = <QuestionMatrixDynamicModel>(
    propertyGrid.survey.getQuestionByName("columns")
  );
  expect(columnsQuestion).toBeTruthy(); //"choices property editor created");
  expect(columnsQuestion.getType()).toEqual("matrixdynamic"); //"It is a matrix";
  expect(columnsQuestion.columns).toHaveLength(3); //"There are three columns");
  expect(columnsQuestion.columns[0].cellType).toEqual("dropdown"); //"Correct cell type created for cellType property"
  expect(columnsQuestion.columns[1].title).toEqual("Name");
  expect(columnsQuestion.visibleRows).toHaveLength(3); //"There are three elements"
  expect(columnsQuestion.visibleRows[0].cells[0].value).toEqual("default"); //"the first cell value is 'default'"
  expect(columnsQuestion.visibleRows[0].cells[1].value).toEqual("col1"); //"the second cell value is 'col1'"
  columnsQuestion.visibleRows[0].cells[1].value = "col11";
  expect(question.columns[0].name).toEqual("col11"); //"column name has been changed"

  columnsQuestion.addRow();
  expect(question.columns).toHaveLength(4); //"There are 4 items now");
  expect(question.columns[3].getType()).toEqual("matrixdropdowncolumn"); //"Object created correctly"
  question.columns[1].title = "Column 2";
  expect(columnsQuestion.visibleRows[1].cells[2].value).toEqual("Column 2"); //"the third cell in second row is correct"
  question.columns[2].cellType = "text";
  expect(columnsQuestion.visibleRows[2].cells[0].value).toEqual("text"); //"react on changing column cell type"
  columnsQuestion.visibleRows[2].cells[0].value = "checkbox";
  expect(question.columns[2].cellType).toEqual("checkbox"); //"change column cell type in matrix"
});

test("Change editingObj of the property grid", () => {
  var question = new QuestionTextModel("q1");
  var question2 = new QuestionTextModel("q2");
  var propertyGrid = new PropertyGridModelTester(question);
  expect(propertyGrid.survey.getValue("name")).toEqual("q1"); //"name property value is set for the first editingObj"
  propertyGrid.obj = question2;
  expect(propertyGrid.survey.getValue("name")).toEqual("q2"); //"name property value is set for the second editingObj"
});
test("Check objValueChangedCallback", () => {
  var count = 0;
  var objValueChangedCallback = () => {
    count++;
  };
  var question = new QuestionTextModel("q1");
  var question2 = new QuestionTextModel("q2");
  var propertyGrid = new PropertyGridModelTester(question);
  propertyGrid.objValueChangedCallback = objValueChangedCallback;
  expect(count).toEqual(0); //"objValueChangedCallback isn't called");
  propertyGrid.obj = question2;
  expect(count).toEqual(1); //"objValueChangedCallback is called after changing obj value"
  propertyGrid.obj = question2;
  expect(count).toEqual(1); //"objValueChangedCallback isn't called after setting same obj value"
  propertyGrid.obj = question;
  expect(count).toEqual(2); //"objValueChangedCallback is called after changing obj value"
});
test("Support property visibleIf attribute", () => {
  var question = new QuestionCheckboxModel("q1");
  var propertyGrid = new PropertyGridModelTester(question);
  var otherTextPropEd = propertyGrid.survey.getQuestionByName("otherText");
  expect(otherTextPropEd).toBeTruthy(); //otherText is here
  expect(otherTextPropEd.isVisible).toEqual(false); //It hidden by default
  question.hasOther = true;
  expect(otherTextPropEd.isVisible).toEqual(true); //We show it now
});
test("Show property editor for condition/expression", () => {
  var question = new QuestionTextModel("q1");
  var propertyGrid = new PropertyGridModelTester(question);
  expect(propertyGrid.survey.getQuestionByName("visibleIf")).toBeTruthy(); //visibleIf is here
  expect(
    propertyGrid.survey.getQuestionByName("defaultValueExpression")
  ).toBeTruthy(); //defaultValueExpression is here
});
test("Support question property editor", () => {
  var survey = new SurveyModel({
    elements: [
      { type: "text", name: "q1" },
      { type: "text", name: "q2" },
    ],
    triggers: [{ type: "skiptrigger", gotoName: "q2" }],
  });
  var trigger = survey.triggers[0];
  var propertyGrid = new PropertyGridModelTester(trigger);
  var gotoNamePropEd = propertyGrid.survey.getQuestionByName("gotoName");
  expect(gotoNamePropEd).toBeTruthy();
  expect(gotoNamePropEd.choices).toHaveLength(2);
  expect(gotoNamePropEd.choices[0].value).toEqual("q1");
  expect(gotoNamePropEd.value).toEqual("q2");
});

test("Validators property editor", () => {
  var question = new QuestionTextModel("q1");
  question.validators.push(new ExpressionValidator());
  var propertyGrid = new PropertyGridModelTester(question);
  var validatorsQuestion = <QuestionMatrixDynamicModel>(
    propertyGrid.survey.getQuestionByName("validators")
  );
  expect(validatorsQuestion).toBeTruthy(); //visibleIf is here
  expect(validatorsQuestion.visibleRows).toHaveLength(1);
  var validatorTypeQuestion =
    validatorsQuestion.visibleRows[0].cells[0].question;
  expect(validatorTypeQuestion.getType()).toEqual("dropdown");
  expect(validatorTypeQuestion.value).toEqual("expressionvalidator");
  var validatorCount = question.getSupportedValidators().length;
  expect(validatorTypeQuestion.choices).toHaveLength(validatorCount);
  validatorsQuestion.addRow();
  expect(question.validators).toHaveLength(2);
  expect(question.validators[1].getType()).toEqual("expressionvalidator");

  validatorTypeQuestion.value = "numericvalidator";
  expect(question.validators[0].getType()).toEqual("numericvalidator");
  expect(question.validators[1].getType()).toEqual("expressionvalidator");
  expect(validatorsQuestion.visibleRows[0].cells[0].value).toEqual(
    "numericvalidator"
  );
  expect(validatorsQuestion.visibleRows[1].cells[0].value).toEqual(
    "expressionvalidator"
  );
  validatorsQuestion.visibleRows[1].showDetailPanel();
  validatorsQuestion.visibleRows[1].detailPanel.getQuestionByName(
    "text"
  ).value = "validator2 text";
  expect(question.validators[1].text).toEqual("validator2 text");
  validatorTypeQuestion = validatorsQuestion.visibleRows[1].cells[0].question;
  validatorTypeQuestion.value = "numericvalidator";
  //validatorsQuestion.visibleRows[1].showDetailPanel();
  expect(
    validatorsQuestion.visibleRows[1].detailPanel.getQuestionByName("text")
      .value
  ).toEqual("validator2 text");
  /* TODO remove comments update to v1.8.19
  expect(
    validatorsQuestion.visibleRows[1].detailPanel.getQuestionByName("minValue")
  ).toBeTruthy();
    */
  //TODO remove comments update to v1.8.19
  //expect(question.validators[0]["valueType"]).toEqual("numericvalidator");
  //expect(question.validators[1]["valueType"]).toEqual("expressionvalidator");
});
test("Triggers property editor", () => {
  var survey = new SurveyModel();
  survey.triggers.push(new SurveyTriggerRunExpression());
  var propertyGrid = new PropertyGridModelTester(survey);
  var triggerrsQuestion = <QuestionMatrixDynamicModel>(
    propertyGrid.survey.getQuestionByName("triggers")
  );
  expect(triggerrsQuestion).toBeTruthy(); //visibleIf is here
  expect(triggerrsQuestion.visibleRows).toHaveLength(1);
  var triggerTypeQuestion = triggerrsQuestion.visibleRows[0].cells[0].question;
  expect(triggerTypeQuestion.getType()).toEqual("dropdown");
  expect(triggerTypeQuestion.value).toEqual("runexpressiontrigger");
  expect(triggerTypeQuestion.choices).toHaveLength(5);
  triggerrsQuestion.addRow();
  expect(survey.triggers).toHaveLength(2);
  expect(survey.triggers[1].getType()).toEqual("runexpressiontrigger");

  triggerTypeQuestion.value = "completetrigger";
  expect(survey.triggers[0].getType()).toEqual("completetrigger");
  expect(survey.triggers[1].getType()).toEqual("runexpressiontrigger");
  expect(triggerrsQuestion.visibleRows[0].cells[0].value).toEqual(
    "completetrigger"
  );
  expect(triggerrsQuestion.visibleRows[1].cells[0].value).toEqual(
    "runexpressiontrigger"
  );
  triggerrsQuestion.visibleRows[1].showDetailPanel();
  triggerrsQuestion.visibleRows[1].detailPanel.getQuestionByName(
    "expression"
  ).value = "{q1} = 1";
  expect(survey.triggers[1].expression).toEqual("{q1} = 1");
  triggerTypeQuestion = triggerrsQuestion.visibleRows[1].cells[0].question;
  triggerTypeQuestion.value = "completetrigger";
  //validatorsQuestion.visibleRows[1].showDetailPanel();
  expect(
    triggerrsQuestion.visibleRows[1].detailPanel.getQuestionByName("expression")
      .value
  ).toEqual("{q1} = 1");
  /* TODO remove comments update to v1.8.19
  expect(
    validatorsQuestion.visibleRows[1].detailPanel.getQuestionByName("minValue")
  ).toBeTruthy();
    */
  //TODO remove comments update to v1.8.19
  //expect(question.validators[0]["valueType"]).toEqual("numericvalidator");
  //expect(question.validators[1]["valueType"]).toEqual("expressionvalidator");
});