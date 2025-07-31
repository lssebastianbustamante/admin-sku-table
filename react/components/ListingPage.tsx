import {
	Page,
	PageContent,
	PageHeader,
	PageHeaderActions,
	PageHeaderTitle,
	PageHeaderTop,
	PageHeaderButton,
	IconPlus,
	createColumns,
	useTableState,
	useDataViewState,
	Table,
	THead,
	THeadCell,
	TBody,
	TBodyRow,
	TBodyCell,
	Tag,
	DataView,
	DataViewHeader,
	Search,
	IconPencil,
	IconEye,
	csx
} from '@vtex/admin-ui'

const ITEMS_PER_PAGE = 25

export const items = [...Array(74).keys()].map((id) => {
	return {
		id: `${id}`,
		name: 'Name',
		textField: 'Text',
		tagField: 'Short text',
	}
})

export default function ListingPage() {
	const view = useDataViewState()

	const columns = createColumns([
		{
			id: 'name',
			header: 'Name',
		},
		{
			id: 'textField',
			header: 'Label',
			width: '5rem',
		},
		{
			id: 'tagField',
			header: 'Label',
			sortable: true,
			width: '8rem',
			resolver: {
				type: 'root',
				render: ({ item }: any) => {
					return <Tag label={item.tagField} />
				},
			},
		},
		{
			id: 'menu',
			width: '5rem',
			resolver: {
				type: 'menu',
				actions: [
					{
						label: 'View details',
						icon: <IconEye />,
						onClick(item: any) {
							console.warn({ item })
						},
					},
					{
						label: 'Edit',
						icon: <IconPencil />,
						onClick(item: any) {
							console.warn({ item })
						},
					},
				],
			},
		},
	])

	const { data, getBodyCell, getHeadCell, getTable } = useTableState({
		status: view.status,
		columns,
		items,
		length: ITEMS_PER_PAGE,
	})

	return (
		<Page>
			<PageHeader>
				<PageHeaderTop>
					<PageHeaderTitle>Items</PageHeaderTitle>
					<PageHeaderActions>
						<PageHeaderButton
							icon={<IconPlus />}
							onClick={() => alert('Redirect to create item action')}
						>
							Create item
						</PageHeaderButton>
					</PageHeaderActions>
				</PageHeaderTop>
			</PageHeader>
			<PageContent layout="wide">
				<DataView state={view}>
					<DataViewHeader>
						<Search />
					</DataViewHeader>

					<Table {...getTable()} className={csx({ width: '100%' })}>
						<THead>
							{columns.map((column: any) => (
								<THeadCell {...getHeadCell(column)} />
							))}
						</THead>
						<TBody>
							{data.map((item: any) => {
								return (
									<TBodyRow key={item.id}>
										{columns.map((column: any) => {
											return <TBodyCell {...getBodyCell(column, item)} />
										})}
									</TBodyRow>
								)
							})}
						</TBody>
					</Table>
				</DataView>
			</PageContent>
		</Page>
	)
}
