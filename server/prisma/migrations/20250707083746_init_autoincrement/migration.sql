-- CreateTable
CREATE TABLE "cart" (
    "cart_pk" SERIAL NOT NULL,
    "product_id_fk" INTEGER,
    "lot_id_fk" INTEGER,
    "amount" INTEGER,
    "unit_price" REAL,

    CONSTRAINT "cart_pkey" PRIMARY KEY ("cart_pk")
);

-- CreateTable
CREATE TABLE "cost" (
    "cost_pk" SERIAL NOT NULL,
    "store_id_fk" INTEGER,
    "product_id_fk" INTEGER,
    "cost" REAL,
    "type_of_category" VARCHAR,
    "amount" INTEGER,
    "date_record" DATE,

    CONSTRAINT "cost_pkey" PRIMARY KEY ("cost_pk")
);

-- CreateTable
CREATE TABLE "customer" (
    "customer_pk" SERIAL NOT NULL,
    "membership_id_fk" INTEGER,
    "citizen_id" VARCHAR,
    "name" VARCHAR,
    "phone_number" VARCHAR,
    "birthday" DATE,
    "gender" VARCHAR,

    CONSTRAINT "customer_pkey" PRIMARY KEY ("customer_pk")
);

-- CreateTable
CREATE TABLE "document" (
    "document_pk" SERIAL NOT NULL,
    "description" VARCHAR,
    "employee_id_fk" INTEGER,
    "issue_date" DATE,

    CONSTRAINT "document_pkey" PRIMARY KEY ("document_pk")
);

-- CreateTable
CREATE TABLE "employee" (
    "employee_pk" SERIAL NOT NULL,
    "tax_id" INTEGER,
    "name" VARCHAR(30),
    "email" VARCHAR(30) NOT NULL,
    "password" VARCHAR(255),
    "phonenumber" VARCHAR(11),
    "gender" VARCHAR(10),
    "birthdate" DATE,
    "address" VARCHAR(255),
    "role_id_fk" INTEGER,

    CONSTRAINT "employee_pkey" PRIMARY KEY ("employee_pk")
);

-- CreateTable
CREATE TABLE "forecasted" (
    "forecasted_pk" SERIAL NOT NULL,
    "model_id_fk" INTEGER,
    "start_date" DATE,
    "end_date" DATE,
    "confidence_interval_lower" DECIMAL(12,2),
    "confidence_interval_upper" DECIMAL(12,2),
    "created_at" DATE,

    CONSTRAINT "forecasted_pkey" PRIMARY KEY ("forecasted_pk")
);

-- CreateTable
CREATE TABLE "forecasted_product" (
    "forecasted_product_pk" SERIAL NOT NULL,
    "forecasted_id_fk" INTEGER,
    "time_id_fk" INTEGER,
    "product_id_fk" INTEGER,
    "cost" REAL,
    "predicted_revenue" REAL,

    CONSTRAINT "forecasted_product_pkey" PRIMARY KEY ("forecasted_product_pk")
);

-- CreateTable
CREATE TABLE "is_allowed" (
    "isallowed_pk" SERIAL NOT NULL,
    "role_id_fk" INTEGER,
    "permission_id_fk" INTEGER,
    "is_allow" BOOLEAN,

    CONSTRAINT "is_allowed_pkey" PRIMARY KEY ("isallowed_pk")
);

-- CreateTable
CREATE TABLE "is_controlled_medicine" (
    "is_controlled_medicine_pk" SERIAL NOT NULL,
    "is_controlled" BOOLEAN,

    CONSTRAINT "is_controlled_medicine_pkey" PRIMARY KEY ("is_controlled_medicine_pk")
);

-- CreateTable
CREATE TABLE "is_pharmacist" (
    "is_pharmacist_pk" SERIAL NOT NULL,
    "employee_id_fk" INTEGER,
    "role_id_fk" INTEGER,
    "pharmacist_id_fk" INTEGER,
    "is_pharmacist" BOOLEAN,

    CONSTRAINT "is_pharmacist_pkey" PRIMARY KEY ("is_pharmacist_pk")
);

-- CreateTable
CREATE TABLE "lot" (
    "lot_pk" SERIAL NOT NULL,
    "stock_id_fk" INTEGER,
    "product_id_fk" INTEGER,
    "name" VARCHAR(20),
    "amount" INTEGER,
    "added_date" DATE,
    "expired_date" DATE,
    "cost" REAL,

    CONSTRAINT "lot_pkey" PRIMARY KEY ("lot_pk")
);

-- CreateTable
CREATE TABLE "membership" (
    "membership_pk" SERIAL NOT NULL,
    "point" INTEGER,

    CONSTRAINT "membership_pkey" PRIMARY KEY ("membership_pk")
);

-- CreateTable
CREATE TABLE "metrics" (
    "metrics_pk" SERIAL NOT NULL,
    "metric_name" VARCHAR,

    CONSTRAINT "metrics_pkey" PRIMARY KEY ("metrics_pk")
);

-- CreateTable
CREATE TABLE "model" (
    "model_pk" SERIAL NOT NULL,
    "name" VARCHAR,

    CONSTRAINT "model_pkey" PRIMARY KEY ("model_pk")
);

-- CreateTable
CREATE TABLE "order" (
    "order_pk" SERIAL NOT NULL,
    "cost_id_fk" INTEGER,
    "revenue_source_id_fk" INTEGER,
    "cart_id_fk" INTEGER,
    "time" DATE,
    "date" DATE,
    "total_amount" INTEGER,
    "total_price" REAL,
    "vat" REAL,
    "employee_id_fk" INTEGER,
    "membership_id_fk" INTEGER,

    CONSTRAINT "order_pkey" PRIMARY KEY ("order_pk")
);

-- CreateTable
CREATE TABLE "permission" (
    "permission_pk" SERIAL NOT NULL,
    "permission" VARCHAR(255),

    CONSTRAINT "permission_pkey" PRIMARY KEY ("permission_pk")
);

-- CreateTable
CREATE TABLE "pharmacist" (
    "pharmacist_pk" SERIAL NOT NULL,
    "employee_id_fk" INTEGER,
    "license" BYTEA,
    "signature" BYTEA,

    CONSTRAINT "pharmacist_pkey" PRIMARY KEY ("pharmacist_pk")
);

-- CreateTable
CREATE TABLE "product" (
    "product_pk" SERIAL NOT NULL,
    "product_name" VARCHAR(255),
    "brand" VARCHAR,
    "price" REAL,
    "product_type_id_fk" INTEGER,
    "unit_id_fk" INTEGER,
    "iscontrolled_id_fk" INTEGER,

    CONSTRAINT "product_pkey" PRIMARY KEY ("product_pk")
);

-- CreateTable
CREATE TABLE "product_types" (
    "producttypes_pk" SERIAL NOT NULL,
    "producttype_name" VARCHAR(50),

    CONSTRAINT "product_types_pkey" PRIMARY KEY ("producttypes_pk")
);

-- CreateTable
CREATE TABLE "purchase_document" (
    "purchase_document_pk" SERIAL NOT NULL,
    "doc_id_fk" INTEGER,
    "store_id_fk" INTEGER,
    "suplier_id_fk" INTEGER,
    "description" VARCHAR,
    "employee_id_fk" INTEGER,
    "issue_date" DATE,

    CONSTRAINT "purchase_document_pkey" PRIMARY KEY ("purchase_document_pk")
);

-- CreateTable
CREATE TABLE "quantity" (
    "quantity_pk" SERIAL NOT NULL,
    "lot_id_fk" INTEGER,
    "stock_id_fk" INTEGER,
    "sales_amount" INTEGER,
    "total_amount" INTEGER,

    CONSTRAINT "quantity_pkey" PRIMARY KEY ("quantity_pk")
);

-- CreateTable
CREATE TABLE "revenue" (
    "revenue_pk" SERIAL NOT NULL,
    "store_id_fk" INTEGER,
    "revenue_source_id_fk" INTEGER,
    "order_id_fk" INTEGER,
    "cost_id_fk" INTEGER,
    "product_id_fk" INTEGER,
    "quantity" INTEGER,
    "total_amount" DECIMAL(12,2),
    "net_profit" REAL,
    "date_received" DATE,

    CONSTRAINT "revenue_pkey" PRIMARY KEY ("revenue_pk")
);

-- CreateTable
CREATE TABLE "revenue_source" (
    "revenue_source_pk" SERIAL NOT NULL,
    "source_name" VARCHAR,
    "description" VARCHAR,

    CONSTRAINT "revenue_source_pkey" PRIMARY KEY ("revenue_source_pk")
);

-- CreateTable
CREATE TABLE "role" (
    "role_pk" SERIAL NOT NULL,
    "role_name" VARCHAR(20),

    CONSTRAINT "role_pkey" PRIMARY KEY ("role_pk")
);

-- CreateTable
CREATE TABLE "stock" (
    "stock_pk" SERIAL NOT NULL,
    "product_id_fk" INTEGER,
    "quantity_id_fk" INTEGER,
    "lot_id_fk" INTEGER,
    "barcode" VARCHAR,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("stock_pk")
);

-- CreateTable
CREATE TABLE "store" (
    "store_pk" SERIAL NOT NULL,
    "name" VARCHAR,
    "contact" VARCHAR,
    "address" VARCHAR,
    "logo" BYTEA,
    "tax_id" VARCHAR,

    CONSTRAINT "store_pkey" PRIMARY KEY ("store_pk")
);

-- CreateTable
CREATE TABLE "supplier" (
    "supplier_pk" SERIAL NOT NULL,
    "name" VARCHAR,
    "tax_id" VARCHAR,
    "address" VARCHAR,
    "description" VARCHAR,

    CONSTRAINT "supplier_pkey" PRIMARY KEY ("supplier_pk")
);

-- CreateTable
CREATE TABLE "time_period" (
    "time_period_pk" SERIAL NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "label" VARCHAR,

    CONSTRAINT "time_period_pkey" PRIMARY KEY ("time_period_pk")
);

-- CreateTable
CREATE TABLE "trend" (
    "trend_pk" SERIAL NOT NULL,
    "product_id_fk" INTEGER,
    "metric_id_fk" INTEGER,
    "product_type_id_fk" INTEGER,
    "time_id_fk" INTEGER,
    "percentage_change" DECIMAL(5,2),

    CONSTRAINT "trend_pkey" PRIMARY KEY ("trend_pk")
);

-- CreateTable
CREATE TABLE "unit" (
    "unit_pk" SERIAL NOT NULL,
    "unit_name" VARCHAR(10),

    CONSTRAINT "unit_pkey" PRIMARY KEY ("unit_pk")
);

-- CreateIndex
CREATE UNIQUE INDEX "employee_email_key" ON "employee"("email");

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_lot_fk" FOREIGN KEY ("lot_id_fk") REFERENCES "lot"("lot_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cart" ADD CONSTRAINT "cart_product_fk" FOREIGN KEY ("product_id_fk") REFERENCES "product"("product_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cost" ADD CONSTRAINT "cost_product_fk" FOREIGN KEY ("product_id_fk") REFERENCES "product"("product_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "cost" ADD CONSTRAINT "cost_store_fk" FOREIGN KEY ("store_id_fk") REFERENCES "store"("store_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "customer" ADD CONSTRAINT "customer_membership_fk" FOREIGN KEY ("membership_id_fk") REFERENCES "membership"("membership_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "document" ADD CONSTRAINT "document_employee_fk" FOREIGN KEY ("employee_id_fk") REFERENCES "employee"("employee_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "employee" ADD CONSTRAINT "employee_role_fk" FOREIGN KEY ("role_id_fk") REFERENCES "role"("role_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "forecasted" ADD CONSTRAINT "forecasted_model_fk" FOREIGN KEY ("model_id_fk") REFERENCES "model"("model_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "forecasted_product" ADD CONSTRAINT "forecasted_product_forecasted_fk" FOREIGN KEY ("forecasted_id_fk") REFERENCES "forecasted"("forecasted_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "forecasted_product" ADD CONSTRAINT "forecasted_product_product_fk" FOREIGN KEY ("product_id_fk") REFERENCES "product"("product_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "forecasted_product" ADD CONSTRAINT "forecasted_product_time_period_fk" FOREIGN KEY ("time_id_fk") REFERENCES "time_period"("time_period_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "is_allowed" ADD CONSTRAINT "isallowed_permission_fk" FOREIGN KEY ("permission_id_fk") REFERENCES "permission"("permission_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "is_allowed" ADD CONSTRAINT "isallowed_role_fk" FOREIGN KEY ("role_id_fk") REFERENCES "role"("role_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "is_pharmacist" ADD CONSTRAINT "is_pharmacist_employee_fk" FOREIGN KEY ("employee_id_fk") REFERENCES "employee"("employee_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "is_pharmacist" ADD CONSTRAINT "is_pharmacist_pharmacist_fk" FOREIGN KEY ("pharmacist_id_fk") REFERENCES "pharmacist"("pharmacist_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "is_pharmacist" ADD CONSTRAINT "is_pharmacist_role_fk" FOREIGN KEY ("role_id_fk") REFERENCES "role"("role_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lot" ADD CONSTRAINT "lot_product_fk" FOREIGN KEY ("product_id_fk") REFERENCES "product"("product_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "lot" ADD CONSTRAINT "lot_stock_fk" FOREIGN KEY ("stock_id_fk") REFERENCES "stock"("stock_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_cart_fk" FOREIGN KEY ("cart_id_fk") REFERENCES "cart"("cart_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_cost_fk" FOREIGN KEY ("cost_id_fk") REFERENCES "cost"("cost_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_employee_fk" FOREIGN KEY ("employee_id_fk") REFERENCES "employee"("employee_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_membership_fk" FOREIGN KEY ("membership_id_fk") REFERENCES "membership"("membership_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_revenue_source_fk" FOREIGN KEY ("revenue_source_id_fk") REFERENCES "revenue_source"("revenue_source_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "pharmacist" ADD CONSTRAINT "pharmacist_employee_fk" FOREIGN KEY ("employee_id_fk") REFERENCES "employee"("employee_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_is_controlled_medicine_fk" FOREIGN KEY ("iscontrolled_id_fk") REFERENCES "is_controlled_medicine"("is_controlled_medicine_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_product_types_fk" FOREIGN KEY ("product_type_id_fk") REFERENCES "product_types"("producttypes_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_unit_fk" FOREIGN KEY ("unit_id_fk") REFERENCES "unit"("unit_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_document" ADD CONSTRAINT "purchase_document_document_fk" FOREIGN KEY ("doc_id_fk") REFERENCES "document"("document_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_document" ADD CONSTRAINT "purchase_document_employee_fk" FOREIGN KEY ("employee_id_fk") REFERENCES "employee"("employee_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_document" ADD CONSTRAINT "purchase_document_store_fk" FOREIGN KEY ("store_id_fk") REFERENCES "store"("store_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "purchase_document" ADD CONSTRAINT "purchase_document_supplier_fk" FOREIGN KEY ("suplier_id_fk") REFERENCES "supplier"("supplier_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quantity" ADD CONSTRAINT "quantity_lot_fk" FOREIGN KEY ("lot_id_fk") REFERENCES "lot"("lot_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "quantity" ADD CONSTRAINT "quantity_stock_fk" FOREIGN KEY ("stock_id_fk") REFERENCES "stock"("stock_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_cost_fk" FOREIGN KEY ("cost_id_fk") REFERENCES "cost"("cost_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_order_fk" FOREIGN KEY ("order_id_fk") REFERENCES "order"("order_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_product_fk" FOREIGN KEY ("product_id_fk") REFERENCES "product"("product_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_revenue_source_fk" FOREIGN KEY ("revenue_source_id_fk") REFERENCES "revenue_source"("revenue_source_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "revenue" ADD CONSTRAINT "revenue_store_fk" FOREIGN KEY ("store_id_fk") REFERENCES "store"("store_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_lot_fk" FOREIGN KEY ("lot_id_fk") REFERENCES "lot"("lot_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_product_fk" FOREIGN KEY ("product_id_fk") REFERENCES "product"("product_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_quantity_fk" FOREIGN KEY ("quantity_id_fk") REFERENCES "quantity"("quantity_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trend" ADD CONSTRAINT "trend_metrics_fk" FOREIGN KEY ("metric_id_fk") REFERENCES "metrics"("metrics_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trend" ADD CONSTRAINT "trend_product_fk" FOREIGN KEY ("product_id_fk") REFERENCES "product"("product_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trend" ADD CONSTRAINT "trend_product_types_fk" FOREIGN KEY ("product_type_id_fk") REFERENCES "product_types"("producttypes_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "trend" ADD CONSTRAINT "trend_time_period_fk" FOREIGN KEY ("time_id_fk") REFERENCES "time_period"("time_period_pk") ON DELETE NO ACTION ON UPDATE NO ACTION;
