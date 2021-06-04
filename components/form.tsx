import {
  Button,
  Checkbox,
  Flex,
  FormGroup,
  Input,
  Panel,
  Select,
  Form as StyledForm,
  Textarea,
  Dropdown,
  FileCopyIcon,
  AssignmentIcon,
  DeleteIcon,
  OpenInNewIcon,
  EditIcon,
} from "@bigcommerce/big-design";
import { ChangeEvent, FormEvent, useState } from "react";
import { FormData, StringKeyValue } from "../types";

interface FormProps {
  formData: FormData;
  onCancel(): void;
  onSubmit(form: FormData): void;
}

const FormErrors = {
  name: "Product name is required",
  price: "Default price is required",
};

function Form({ formData, onCancel, onSubmit, metafields }: FormProps) {
  console.log("metafields", metafields);

  const { description, isVisible, name, price, type } = formData;
  const [form, setForm] = useState<FormData>({
    description,
    isVisible,
    name,
    price,
    type,
    lang: "EN",
  });

  console.log("1232", form);

  const [errors, setErrors] = useState<StringKeyValue>({});

  const handleChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name: formName, value } = event?.target;
    setForm((prevForm) => ({ ...prevForm, [formName]: value }));

    // Add error if it exists in FormErrors and the input is empty, otherwise remove from errors
    !value && FormErrors[formName]
      ? setErrors((prevErrors) => ({
          ...prevErrors,
          [formName]: FormErrors[formName],
        }))
      : setErrors(({ [formName]: removed, ...prevErrors }) => ({
          ...prevErrors,
        }));
  };

  const handleSelectChange = (value: string) => {
    console.log("lang select", value);
    setForm((prevForm) => ({ ...prevForm, type: value }));
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked, name: formName } = event?.target;
    setForm((prevForm) => ({ ...prevForm, [formName]: checked }));
  };

  const handleSubmit = (event: FormEvent<EventTarget>) => {
    event.preventDefault();
    console.log("submit", form);

    // If there are errors, do not submit the form
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) return;

    onSubmit(form);
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <Panel header="Basic Information">
        <FormGroup>
          <Input
            error={errors?.name}
            label="Product name"
            name="name"
            required
            value={form.name}
            onChange={handleChange}
          />
        </FormGroup>
      </Panel>

      <Panel header="Translations">
        <FormGroup>
          <Select
            label="Translations Language"
            name="lang"
            options={[
              { value: "ES", content: "ES" },
              { value: "CA-FR", content: "CA-FR" },
            ]}
            placeholder="Select Language"
            required
            value={form.type}
            onOptionChange={handleSelectChange}
          />
        </FormGroup>
        <FormGroup>
          <Textarea
            label={form.type + "  " + "name"}
            name="name"
            placeholder="Name info"
            required
            value={form.name}
            onChange={handleChange}
          />
          <Textarea
            label={form.type + "  " + "Description"}
            name="description"
            placeholder="Product info"
            required
            value={form.description}
            onChange={handleChange}
          />
        </FormGroup>
      </Panel>
      <Flex justifyContent="flex-end">
        <Button
          marginRight="medium"
          type="button"
          variant="subtle"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </Flex>
    </StyledForm>
  );
}

export default Form;
