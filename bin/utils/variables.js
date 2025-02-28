module.exports = {
  functionalVersion: '1.2.1',
  importLine: `import {Card, CardList, Accordion, AccordionGroup, Callout, Image, Video, Tabs, TabItem} from "@site/src/components";\n`,
  referenceImports: `
import ApiTabs from "@theme/ApiTabs";
import DiscriminatorTabs from "@theme/DiscriminatorTabs";
import Heading from "@theme/Heading";
import MethodEndpoint from "@theme/ApiExplorer/MethodEndpoint";
import MimeTabs from "@theme/MimeTabs";
import OperationTabs from "@theme/OperationTabs";
import ParamsItem from "@theme/ParamsItem";
import ResponseSamples from "@theme/ResponseSamples";
import SchemaItem from "@theme/SchemaItem";
import SchemaTabs from "@theme/SchemaTabs";
import SecuritySchemes from "@theme/ApiExplorer/SecuritySchemes";
import ParamsDetails from "@theme/ParamsDetails";
import RequestSchema from "@theme/RequestSchema";
import StatusCodes from "@theme/StatusCodes";
`
}